import app from "./app";
import { Config } from "./config";
import logger from "./config/logger";

const startServer = () => {
   try {
      const PORT = Config.PORT;
      app.listen(PORT, () => {
         // console.log(`Listening on port ${Config.PORT}`);
         logger.info(`listening on port ${Config.PORT}`);
      });
   } catch (error: unknown) {
      if (error instanceof Error) {
         logger.error(error.message);
         setTimeout(() => {
            process.exit(1);
         }, 1000);
      }
   }
};

startServer();
