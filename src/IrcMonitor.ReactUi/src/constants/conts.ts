import moment from "moment";

export const years: number[] = Array.from(
  { length: moment().year() - 2009 + 1 },
  (_, i) => 2024 - i
);
interface PageConfig {
  pageContentMinHeight: string;
}

// Move
export const uiConfig: PageConfig = {
  pageContentMinHeight: "500px"
};
