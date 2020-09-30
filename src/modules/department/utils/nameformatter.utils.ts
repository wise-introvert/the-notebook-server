import * as i from "i";

const inflect = i();

export const formatDepartmentName = (n: string): string => {
  let name: string = !n.toLowerCase().startsWith("department of")
    ? `department of ${n}`
    : n;

  return inflect.titleize(name);
};
