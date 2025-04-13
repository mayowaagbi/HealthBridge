import { format } from "date-fns";

export const formatDate = (date) => format(new Date(date), "yyyy-MM-dd");
export const formatDateTime = (date) =>
  format(new Date(date), "yyyy-MM-dd HH:mm:ss");
