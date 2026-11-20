import { sendSuccess } from "../../helpers/response.helper.js";
import AppContentService from "../../services/appContent.service.js";
import HelpService from "../../services/faq.service.js";

export const AppContentController = {
  getContactAndTimings: async (req, res, next) => {
    try {
      const result = await AppContentService.getContactAndTimings();
      return sendSuccess(res, {
        message: "Contact Us details fetched successfully",
        data: result,
      });
    } catch (err) {
      next(err);
    }
  },
  getActiveFaqs: async (req, res, next) => {
    try {
      const faqs = await HelpService.getActiveFaqsForMobile();

      return sendSuccess(res, {
        message: "Active FAQs fetched successfully",
        data: faqs,
      });
    } catch (error) {
      next(error);
    }
  },
};

export default AppContentController;
