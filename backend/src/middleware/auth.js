import jwt from "jsonwebtoken";

export default function auth(req, res, next) {
  const header = req.headers.authorization;

  if (!header) {
    return res.status(401).json({ message: "Token não fornecido" });
  }

  const [type, token] = header.split(" ");

  if (type !== "Bearer" || !token) {
    return res.status(401).json({ message: "Token inválido" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;   // <-- guarda o id do user na request
    next(); // <-- deixa a rota continuar
  } catch (err) {
    return res.status(401).json({ message: "Token expirado ou inválido" });
  }
}