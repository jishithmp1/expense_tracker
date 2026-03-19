const express = require("express");
const dotenv = require("dotenv").config();
const cors = require("cors");
const mysql = require("mysql2/promise");
const { log } = require("node:console");

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

const pool = mysql.createPool("mysql://root:yLgTMvLKHklUmcfEJpcCrLYwrssqxoXv@autorack.proxy.rlwy.net:10033/railway");

app.post("/create", create);
app.post("/remove", remove);

async function create(req, res) {
  const { title, income, expense, category } = req.body;

  if (!title || !income || !expense || !category) {
    return res.status(400).json({ ok: false, message: "invalid data" });
  }

  let sql =
    "INSERT INTO expenses (title, category, expense, income, balance) VALUES (?, ?, ?, ?, ?)";
  const balance = income - expense;

  try {
    const [result] = await pool.execute(sql, [
      title,
      category,
      expense,
      income,
      balance,
    ]);

    if (result.affectedRows > 0) {
        sql = "SELECT * FROM expenses WHERE id = ?";
        const [rows] = await pool.execute(sql, [result.insertId]);
        if (rows.length === 0) {
            return res
        .status(500)
        .json({ ok: false, message: "Internal server error" });
        } else {
            return res
        .status(201)
        .json({ ok: true, message: "created successfully", data: rows[0] });
        }
      
    } else {
      return res
        .status(500)
        .json({ ok: false, message: "Internal server error" });
    }
  } catch (e) {
    console.log("db error", e);
    return res
      .status(500)
      .json({ ok: false, message: "Internal server error", e});
  }
}

async function remove(req, res) {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ ok: false, message: "invalid data" });
  }

  const sql =
    "DELETE FROM expenses WHERE id = ?";

  try {
    const [result] = await pool.execute(sql, [id]);

    if (result.affectedRows > 0) {
      return res
        .status(201)
        .json({ ok: true, message: "removed successfully" });
    } else {
      return res
        .status(500)
        .json({ ok: false, message: "Internal server error" });
    }
  } catch (e) {
    console.log(e);
    return res
      .status(500)
      .json({ ok: false, message: "Internal server error" });
  }
}

app.listen(process.env.PORT || 3000, console.log("server running..."));
