import { useCallback, useState } from "react";
import CafeSettings from "./CafeSettings";
import ConfirmModal from "./ConfirmModal";
import Groups from "./Groups";
import Items from "./Items";
import Tables from "./Tables";
import Users from "./Users";
import UsersDetails from "./UsersDetails";
import {ensureGroupsExist,ensureItemsExist,ensureTablesExist,}from "./services/setupService";
import InvoicesPage from "./InvoicesPage";
import ClosedInvoicesPage from "./ClosedInvoicesPage";
import useShiftState from "./hooks/useShiftState";
import {btn,card,cardTitle,emptyCard,groupsCard,groupsWrapper,settingCard,styles,
       subBtn,subMenuBtn,tablesCard,userDetailsCard,usersCard,} from "./styles/dashboardStyles";

export default function Dashboard({ user, permissions = [], onLogout }) {
  const [mainMenu, setMainMenu] = useState(null);
  const [subMenu, setSubMenu] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [editValues, setEditValues] = useState({});
  const [users, setUsers] = useState([]);
  const [showShiftConfirm, setShowShiftConfirm] = useState(false);
  const [toast, setToast] = useState(null);
  const [activePage, setActivePage] = useState(null);
  const [spin, setSpin] = useState(false);
  const [spin2, setSpin2] = useState(false);
  const showToast = useCallback((message, type = "success", action = null) => {
    setToast({ message, type, action });setTimeout(() => {setToast(null);}, 2000);}, []);
  const {shiftDate,setShiftDate,choiceShiftPage,setShiftType,savingShift,savedShiftDate,savedShiftType,
         isShiftChanged,resetShiftToOriginal,saveShift,} = useShiftState({ cafeId: user?.cafe_id, showToast });
  const hasPermission = (key) => permissions?.includes(key);

  const resetUI = () => {setMainMenu(null);setSubMenu(null);setSelectedGroup(null);setSelectedUser(null);};

  const setActiveMainMenu = (menu) => {resetShiftToOriginal();setMainMenu(menu);
    setSubMenu(null);setSelectedGroup(null);setSelectedUser(null);};

  const selectUser = (selected) => {setSelectedUser(selected);
    if (!selected) {setEditValues({});return;}
    setEditValues({
      [selected.id]: {name: selected.name || "",username: selected.username || "",password: selected.password || "", },
    });
  };

  const openItems = async () => {
    const { error } = await ensureGroupsExist(user?.cafe_id);
    if (error) {console.log("Ensure groups error:", error);return;}
    setSubMenu("items");
    setSelectedGroup(null);
    setSelectedUser(null);
  };

  const openTables = async () => {
    const { error } = await ensureTablesExist(user?.cafe_id);
    if (error) {console.log("Ensure tables error:", error);return;}
    setSubMenu("tables");
    setSelectedGroup(null);
    setSelectedUser(null);
  };

if (activePage === "openInvoices") {
  return (
    <InvoicesPage
      currentShiftDate={savedShiftDate}
      currentShiftType={savedShiftType}
      user={user}
      onBack={() => setActivePage(null)}
      permissions={permissions}
    />
  );
}

if (activePage === "closedInvoices") {
  return (
    <ClosedInvoicesPage
      currentShiftDate={savedShiftDate}
      currentShiftType={savedShiftType}
      user={user}
      onBack={() => setActivePage(null)}
      permissions={permissions}
    />
  );
}

  return (
   <div style={{...styles.container }}>
   <div
  style={{...styles.sidebar}}
>
        <div>
          <div style={styles.cafeName}>{user?.cafe_name || "Cafe"}</div>
          <button onClick={() => setActiveMainMenu("basic")} style={btn(mainMenu === "basic")}>
            بـيـانـات أسـاسـيـة
          </button>
          <button onClick={() => setActiveMainMenu("morning")} style={btn(mainMenu === "morning")}>
           فـواتـير
          </button>

          <button onClick={() => setActiveMainMenu("reports")} style={btn(mainMenu === "reports")}>
            تـقـاريـر
          </button>
        </div>
  <div style={{ flex: 1 }} />


<div style={{ cursor: hasPermission("date.shift") ? "auto" : "not-allowed" }}>
  <div
    style={{
      ...styles.footerCard,
      opacity: hasPermission("date.shift") ? 1 : 0.4,
      pointerEvents: hasPermission("date.shift") ? "auto" : "none",
    }}
  >
    <div style={styles.shiftDateGroup}>
      <input
        type="date"
        value={shiftDate}
        onClick={() => resetUI()}
        onChange={(e) => setShiftDate(e.target.value)}
        style={styles.shiftDateInput}
        onKeyDown={(e) => e.preventDefault()}
      />
    </div>

    <div style={styles.shiftBtnsRow}>
      <button
        onClick={() => { setShiftType("AM"); resetUI(); }}
        style={{
          ...styles.shiftBtn,
          ...(choiceShiftPage === "AM" ? styles.shiftBtnActive : {}),
        }}
      >
        AM
      </button>

      <button
        onClick={() => { setShiftType("PM"); resetUI(); }}
        style={{
          ...styles.shiftBtn,
          ...(choiceShiftPage === "PM" ? styles.shiftBtnActive : {}),
        }}
      >
        PM
      </button>
    </div>

    <button
      onClick={() => setShowShiftConfirm(true)}
      disabled={!isShiftChanged || savingShift}
      style={{
        ...styles.shiftSaveBtn,
        color: "#ffffff",
        opacity: !isShiftChanged || savingShift ? 0.8 : 1,
        cursor: !isShiftChanged || savingShift ? "not-allowed" : "pointer",
        background: !isShiftChanged || savingShift ? "#94a3b8" : "#2563eb",
      }}
    >
      {savingShift ? "Saving..." : "Save"}
    </button>
  </div>
</div>

        <div style={{ flex: 1 }} />
<div 
style={styles.bottomSection}>

  <div 
  
    onClick={() => {
    setSpin2(true);
    setTimeout(() => setSpin2(false), 400);
  }}
    style={{...styles.footerCard,
    transform: spin2 ? "rotateY(60deg)" : "rotateY(0deg)",
    transition: "transform 0.8s ease",
    transformStyle: "preserve-3d",
    cursor: "pointer",
  }}
  
  >
    <div style={styles.footerImageBox}>
      <img src="/logo2.png" alt="logo" style={styles.footerImage} />
    </div>

    <div style={styles.footerText}>Powered by Go Cafe System</div>
  </div>

      <button
        onClick={() => {
          resetShiftToOriginal();
          resetUI();
          setShowLogoutModal(true);
        }}
        style={styles.logoutBtn}
      >
        Logout
      </button>
</div>

      </div>

      <div
  style={{
    ...styles.content,
    backgroundColor:savedShiftType === "PM"? "#e2e8f5": "#f4f7fb",
      margin: 0,
  padding: 0,
  minHeight: "100vh",
  }}
>

<div style={{...styles.headerCard,

  }}>
  {/* الشمال */}
  <div style={styles.left}>
    Welcome {user?.name}
  </div>
  {/* النص */}
  <div style={styles.center}>
    {savedShiftDate
      ? new Date(savedShiftDate).toLocaleDateString("ar-EG", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : ""}
  </div>
  {/* اليمين */}
  <div style={styles.right}>
    {savedShiftType  === "AM" ? "شيفت صباحي" : "شيفت مسائي"}
  </div>
</div>
        {mainMenu === "basic" && (
          <>
            <div style={card}>
              <h3 style={cardTitle}>بـيـانـات أسـاسـيـة</h3>

              {hasPermission("items.view") && (
                <button style={subMenuBtn(subMenu === "items")} onClick={openItems}>
                  الأصـنـاف
                </button>
              )}

              {hasPermission("users.view") && (
                <button
                  style={subMenuBtn(subMenu === "users")}
                  onClick={() => {
                    setSubMenu("users");
                    setSelectedGroup(null);
                    selectUser(null);
                  }}
                >
                  الـمـسـتـخـدمـيـن
                </button>
              )}

              {hasPermission("tables.view") && (
                <button style={subMenuBtn(subMenu === "tables")} onClick={openTables}>
                  الـطـاولات
                </button>
              )}

              {hasPermission("options.view") && (
                <button
                  style={subMenuBtn(subMenu === "choices")}
                  onClick={() => {
                    setSubMenu("choices");
                    setSelectedGroup(null);
                    setSelectedUser(null);
                  }}
                >
                  أخـتـيـارات أخـرى
                </button>
              )}
            </div>

            {subMenu === "items" && (
              <div style={groupsWrapper}>
                <div style={groupsCard}>
                  <h3 style={cardTitle}>مـجـمـوعـات الأصـنـاف</h3>
                  <Groups
                    user={user}
                    onSelectGroup={async (group) => {
                      setSelectedGroup(group);

                      if (group?.id) {
                        const { error } = await ensureItemsExist(user?.cafe_id, group.id);

                        if (error) {
                          console.log("Ensure items error:", error);
                        }
                      }
                    }}
                  />
                </div>

                {selectedGroup ? (
                  <div style={tablesCard}>
                    <h3 style={cardTitle}>{selectedGroup.name}</h3>
                    <Items user={user} group={selectedGroup} />
                  </div>
                ) : (
                  <div style={emptyCard}>اختر مجموعة لعرض الأصناف</div>
                )}
              </div>
            )}

            {subMenu === "tables" && (
              <div style={groupsWrapper}>
                <div style={tablesCard}>
                  <h3 style={cardTitle}>الـطـاولات</h3>
                  <Tables user={user} />
                </div>
              </div>
            )}

            {subMenu === "choices" && (
              <div style={groupsWrapper}>
                <div style={settingCard}>
                  <h3 style={cardTitle}>أخـتـيـارات أخـرى</h3>
                  <CafeSettings user={user} />
                </div>
              </div>
            )}

            {subMenu === "users" && (
              <div style={groupsWrapper}>
                <div style={usersCard}>
                  <h3 style={cardTitle}>الـمـسـتـخـدمـيـن</h3>

                  <Users
                    user={user}
                    users={users}
                    setUsers={setUsers}
                    selectedUser={selectedUser}
                    onSelectUser={selectUser}
                    editValues={editValues}
                    setEditValues={setEditValues}
                  />
                </div>

                {selectedUser ? (
                  <div style={userDetailsCard}>
                    <h3 style={cardTitle}>{selectedUser.name}</h3>
 
                    <UsersDetails
                      selectedUser={selectedUser}
                      setSelectedUser={setSelectedUser}
                      users={users}
                      setUsers={setUsers}
                      editValues={editValues}
                      setEditValues={setEditValues}
                      user={user}
                    />
                  </div>
                ) : (
                  <div style={emptyCard}>اختر مستخدم لعرض التفاصيل</div>
                )}
              </div>
            )}
          </>
        )}

        {mainMenu === "morning" && (
          <div style={card}>
            <h3 style={cardTitle}>فـواتـيـر</h3>

            {hasPermission(
              savedShiftType === "AM"
                ? "Invoices.am.open"
                : "Invoices.pm.open"
            ) && (
              <button 
                onClick={() => setActivePage("openInvoices")}
                style={subBtn}
              > فـواتـيـر مـفـتـوحـة</button>
            )}

            {hasPermission(
              savedShiftType === "AM"
                ? "Invoices.am.closed"
                : "Invoices.pm.closed"
            ) && ( <button 
               onClick={() => setActivePage("closedInvoices")}
              style={subBtn}>فـواتـيـر مـغـلـقـة</button>
            )}
            
            {hasPermission(
              savedShiftType === "AM"
                ? "Invoices.am.deleted"
                : "Invoices.pm.deleted"
            ) && <button style={subBtn}>مـحـذوفـات الـشـيـفـت</button>}
          </div>
        )}


        {mainMenu === "reports" && (
          <div style={card}>
            <h3 style={cardTitle}>تقارير</h3>
            {hasPermission("report.captain") && <button style={subBtn}>تـقـرير كـابـتـن</button>}
            {hasPermission("report.items") && <button style={subBtn}>تـقـرير الأصـنـاف</button>}
          </div>
        )}

<div
  onClick={() => {
    setSpin(true);
    setTimeout(() => setSpin(false), 400);
  }}
  style={{
    ...styles.fixedInfoBox,
    background:
      savedShiftType === "PM"
        ? "linear-gradient(180deg, #111827 0%, #2c4778 100%)"
        : "linear-gradient(180deg, #ffffff 0%, #9fb5d2 100%)",
    color: savedShiftType === "PM" ? "#f3f4f6" : "#000000",

    transform: spin ? "rotateY(60deg)" : "rotateY(0deg)",
    transition: "transform 0.8s ease",
    transformStyle: "preserve-3d",
    cursor: "pointer",
  }}
>
  {/* اليوم */}
  <div style={{ fontSize: "16px", fontWeight: "700", textAlign: "center"}}>
    {savedShiftDate
      ? new Date(savedShiftDate).toLocaleDateString("ar-EG", {
          weekday: "long",
        })
      : ""}
  </div>

  {/* التاريخ */}
  <div style={{ fontSize: "18px", fontWeight: "550", textAlign: "center", marginTop: "4px" }}>
    {savedShiftDate
      ? new Date(savedShiftDate).toLocaleDateString("ar-EG", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : ""}
  </div>

  {/* الشيفت */}
  <div style={{ fontSize: "16px", fontWeight: "550", textAlign: "center", marginTop: "6px" }}>
    {savedShiftType === "AM" ? "شيفت صباحي" : "شيفت مسائي"}
  </div>

  {/* الكاشير */}
  <div style={{ fontSize: "16px",textAlign: "center", fontWeight: "550" }}>
    {user?.name || ""}
  </div>
</div>

      </div>

      <ConfirmModal
        open={showLogoutModal}
        title="تسجيل الخروج"
        message="هل تريد تسجيل الخروج ؟"
        onCancel={() => setShowLogoutModal(false)}
        onConfirm={() => {
          setShowLogoutModal(false);
          onLogout();
        }}
      />

      <ConfirmModal
      open={showShiftConfirm}
      title="تغيير تاريخ الشيفت"
      message="هل تريد حفظ تاريخ الشيفت ؟"
      onCancel={() => setShowShiftConfirm(false)}
      onConfirm={async () => {
        setShowShiftConfirm(false);
        await saveShift();
      }}
    />

          {toast && (
        <div style={{
          cursor: "pointer",
          position: "fixed",
          bottom: 200,
          left: 270,
          background: toast.type === "error" ? "#ef4444" : "#22c55e",
          color: "white",
          padding: "10px 15px",
          borderRadius: 8,
          zIndex: 99999,
          fontWeight: "700",
          fontSize: "16px",
          minWidth: "180px",
          boxShadow: "0 6px 18px rgba(0,0,0,0.25)",
          textAlign: "center",
        }}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
