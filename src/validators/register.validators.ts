// import { body } from "express-validator";

// export default [
//    body("email").notEmpty().withMessage("Email field is required!"),
// ];

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
   email: {
      trim: true,
      errorMessage: "Email is required!",
      notEmpty: true,
      isEmail: {
         errorMessage: "Email should be a valid email",
      },
   },
   password: {
      trim: true,
      errorMessage: "Last name is required!",
      notEmpty: true,
      isLength: {
         options: {
            min: 8,
         },
         errorMessage: "Password length should be at least 8 chars!",
      },
   },
});
// export default [body("email").notEmpty().withMessage("Email is required!")];
