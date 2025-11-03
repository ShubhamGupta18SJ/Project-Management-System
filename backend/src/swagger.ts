// import swaggerJsDoc from "swagger-jsdoc";
// import swaggerUi from "swagger-ui-express";
// import { Express } from "express";

// const options = {
//   definition: {
//     openapi: "3.0.0",
//     info: {
//       title: "Chat API",
//       version: "1.0.0",
//       description: "API documentation for your Node.js + Socket.io project",
//     },
//     servers: [
//       {
//         url: "http://localhost:5000",
//       },
//     ],
//   },
//   apis: ["./src/routes/*.ts"], // 👈 route files
// };

// const swaggerSpec = swaggerJsDoc(options);

// export const setupSwagger = (app: Express) => {
//   app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// };


import swaggerJsDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Application } from "express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Chat API",
      version: "1.0.0",
      description: "API documentation for your Node.js + Socket.io project",
    },
    servers: [{ url: "http://localhost:5000" }],
  },
  apis: ["./src/routes/*.ts"],
};

const swaggerSpec = swaggerJsDoc(options);

export const setupSwagger = (app: Application) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};
