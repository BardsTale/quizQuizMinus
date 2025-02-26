const express = require("express");
const cors = require("cors");
const { swaggerUi, specs } = require("./swagger");

const app = express();
const PORT = 5000;

// 미들웨어 설정
app.use(cors());
app.use(express.json()); // JSON 파싱

// Swagger UI 설정
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

// [1] 데이터 저장용 배열 (임시 DB 역할)
let items = [
  { id: 1, name: "사과" },
  { id: 2, name: "바나나" },
  { id: 3, name: "오렌지" },
];

// [2] CRUD API 구현

// (1) 전체 데이터 조회 (GET)
/**
 * @swagger
 * /items:
 *   get:
 *     summary: "전체 데이터 조회"
 *     description: "전체 데이터 목록을 가져온다."
 *     responses:
 *       200:
 *         description: 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   name:
 *                     type: string
 *                     example: "사과"
 */
app.get("/items", (req, res) => {
  res.json(items);
});

// (2) 단일 항목 조회 (GET)
app.get("/items/:id", (req, res) => {
  const item = items.find((i) => i.id === parseInt(req.params.id));
  if (!item) return res.status(404).json({ message: "Item not found" });
  res.json(item);
});

// (3) 데이터 추가 (POST)
app.post("/items", (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: "Name is required" });

  const newItem = { id: items.length + 1, name };
  items.push(newItem);
  res.status(201).json(newItem);
});

// (4) 데이터 수정 (PUT)
app.put("/items/:id", (req, res) => {
  const item = items.find((i) => i.id === parseInt(req.params.id));
  if (!item) return res.status(404).json({ message: "Item not found" });

  item.name = req.body.name || item.name;
  res.json(item);
});

// (5) 데이터 삭제 (DELETE)
app.delete("/items/:id", (req, res) => {
  items = items.filter((i) => i.id !== parseInt(req.params.id));
  res.json({ message: "Item deleted" });
});

// 서버 실행
app.listen(PORT, () => {
  console.log(`API 서버 실행: http://localhost:${PORT}`);
});