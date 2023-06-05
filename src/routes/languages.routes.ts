import express from "express";

import {
  type Request,
  type Response,
  type NextFunction,
} from "express";

import { sqlQuery } from "../databases/sql-db";

import { type Programming_languagesBody } from "../models/sql/ProgrammingLanguages";

export const languagesRouter = express.Router();

// CRUD: READ
languagesRouter.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const raws = await sqlQuery(`
    SELECT *  
    FROM programming_languages
    `)

    const response = { data: raws }

    res.json(response);
  } catch (error) {
    next(error);
  }
});

// CRUD: READ
languagesRouter.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id
    const raws = await sqlQuery(`
    SELECT *  
    FROM programming_languages
    WHERE id=${id}
    `)
    if (raws?.[0]) {
      const response = { data: raws }
      res.json(response)
    } else {
      res.status(404).json({ error: "Languages not found" })
    }
  } catch (error) {
    next(error);
  }
});

// CRUD: CREATE
languagesRouter.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, releasedYear, githutRank, pyplRank, tiobeRank } = req.body as Programming_languagesBody
    const query: string = `
    INSERT INTO programming_languages (name, released_year, githut_rank, pypl_rank, tiobe_rank)
    VALUES (?, ?, ?, ?, ?)
    `
    const params = [name, releasedYear, githutRank, pyplRank, tiobeRank]
    const result = await sqlQuery(query, params)
    if (result) {
      return res.status(201).json({})
    } else {
      res.status(500).json({ error: "Language not created" })
    }
  } catch (error) {
    next(error);
  }
});

// CRUD: DELETE
languagesRouter.delete("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id)
    const raws = await sqlQuery(`
    DELETE 
    FROM programming_languages
    WHERE id=${id}
    `)
    res.json({ message: "Language delete" })
    const response = { data: raws }

    res.json(response);
  } catch (error) {
    next(error);
  }
});

// CRUD: UPDATE
languagesRouter.put("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id)
    const { name, releasedYear, githutRank, pyplRank, tiobeRank } = req.body as Programming_languagesBody
    const params = [name, releasedYear, githutRank, pyplRank, tiobeRank]
    const query = `
    UPDATE programming_languages
    SET name = ?, released_year= ?, githut_rank= ?, pypl_rank= ?, tiobe_rank= ?
    WHERE id = ${id}`

    await sqlQuery(query, params)

    const raws = await sqlQuery(`
    SELECT *  
    FROM programming_languages
    WHERE id=${id}
    `)

    if (raws?.[0]) {
      const response = { data: raws }
      res.json(response)
    } else {
      res.status(404).json({ error: "Languages not found" })
    }
  } catch (error) {
    next(error);
  }
});
