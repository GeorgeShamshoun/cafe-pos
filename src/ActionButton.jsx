export default function ActionButton({
  children,
  onClick,
  disabled = false,
  loading = false,
  style,
  title,
  buttonRef,
  onFocus,
  onKeyDown,
}) {
  const isDisabled = disabled || loading;

  return (
    <button
      type="button"
      ref={buttonRef}
      title={title}
      disabled={isDisabled}
      onFocus={onFocus}
      onKeyDown={onKeyDown}
      onClick={(e) => {
        if (isDisabled) return;
        onClick?.(e);
      }}
      style={{
        ...styles.button,
        opacity: isDisabled ? 0.45 : 1,
        cursor: isDisabled ? "not-allowed" : "pointer",
        ...style,
      }}
    >
      {loading ? "..." : children}
    </button>
  );
}

const styles = {
  button: {
    height: "34px",
    width: "34px",
    flexShrink: 0,
    border: "none",
    borderRadius: "7px",
    background: "#e5e7eb",
    cursor: "pointer",
    fontWeight: "700",
    boxShadow: "0 1px 2px rgba(17,24,39,0.08)",
  },
};
