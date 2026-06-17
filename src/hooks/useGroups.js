import { useItemGroups } from "../data/itemGroupsTable";

export default function useGroups(cafeId) {
  const { rows } = useItemGroups(cafeId);
  return rows;
}
