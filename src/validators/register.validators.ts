// import { body } from "express-validator";

// export default [
//    body("email").notEmpty().withMessage("Email field is required!"),
// ];

import { checkSchema } from "express-validator";

export default checkSchema({
   email: {
      errorMessage: "Email field is required",
      notEmpty: true,
      trim: true,
   },
   password: {},
});
