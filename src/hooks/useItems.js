import { useItemsByGroup } from "../data/itemsTable";

export default function useItems(cafeId, groupId) {
  const { rows } = useItemsByGroup(cafeId, groupId);
  return rows;
}
