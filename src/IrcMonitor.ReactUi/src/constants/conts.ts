import moment from "moment";

const currentYear = moment().year();
export const years = Array.from({ length: currentYear - 2009 + 1 }, (_, i) => 2009 + i);

interface PageConfig {
  pageContentMinHeight: string;
}

// Move
export const uiConfig: PageConfig = {
  pageContentMinHeight: "500px"
};
