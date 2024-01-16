import { checkSchema } from "express-validator";

export default checkSchema({
   firstname: {
      errorMessage: "First name is required!",
      notEmpty: true,
      trim: true,
   },
   lastname: {
      errorMessage: "Last name is required!",
      notEmpty: true,
      trim: true,
   },
   role: {
      errorMessage: "Role is required!",
      notEmpty: true,
      trim: true,
   },
});
