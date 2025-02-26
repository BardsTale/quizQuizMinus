const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

// Swagger 설정
const options = {
  definition: {
    openapi: "3.0.0", // OpenAPI 버전
    info: {
      title: "Node.js API 문서", // 문서 제목
      version: "1.0.0", // 문서 버전
      description: "Express + Swagger를 활용한 API 문서 예제", // 설명
    },
    servers: [
      {
        url: "http://localhost:5000", // 서버 URL
      },
    ],
  },
  apis: ["./server.js"], // API 문서로 만들 파일 경로
};

const specs = swaggerJsdoc(options);

module.exports = { swaggerUi, specs };