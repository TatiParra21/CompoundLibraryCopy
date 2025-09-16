import express from "express"
import { pool } from "./db"
import type { Request,Response, Router } from "express"
import { QueryResult } from "pg"
const router: Router = express.Router()
export type HexBodyType ={
  hex: string,
  closest_named_hex: string,
  clean_hex: string
}
export type ColorBodyType ={
  name: string,
  closest_named_hex: string
}
export type ColorContrastType={
  hex1:string,
  hex2:string,
  contrast_ratio: number, 
  aatext:boolean, 
  aaatext:boolean
}
export type SavedUserColorSchemeType={
  user_id:string,
  scheme_name:string,
  hex1:string,
  hex1name:string,
  hex2:string,
  hex2name:string,
  contrast_ratio: number, 
  aatext:boolean, 
  aaatext:boolean
}
const errorResponses: Record<string, string>={
'23505': 'Color already exists',
'23503':'Color messes with table constraint',
'23502': 'Not null violation',
}

///tells router to handle posts requests in the route /colors

const makeValuesAndPlaceHolder =<T extends HexBodyType | ColorBodyType |ColorContrastType>(body:T[] )=>{
  const values: (string | number | boolean)[] = [];
  const placeholders: string[] = [];
  if("name" in body[0]){
     body.forEach((entry, index) => {
      const color = entry as ColorBodyType
    const i = index * 2;
    placeholders.push(`($${i + 1}, $${i + 2})`);
    values.push(color.name, color.closest_named_hex);
  });
  

  }else if("hex" in body[0] && "clean_hex" in body[0]){
     body.forEach((entry, index) => {
      const i = index * 3;
      const color = entry as HexBodyType
      placeholders.push(`($${i + 1}, $${i + 2}, $${i + 3})`);
      values.push(color.hex, color.closest_named_hex, color.clean_hex);
    });
  }else if("user_id" in body[0]){
     body.forEach((entry, index) => {
      const i = index * 9;
      const color = entry as SavedUserColorSchemeType
      placeholders.push(`($${i + 1}, $${i + 2}, $${i + 3}, $${i + 4}, $${i + 5}, $${i + 6}, $${i + 7}, $${i + 8},$${i + 9})`);
      values.push(color.user_id, color.scheme_name,color.hex1, color.hex1name, color.hex2,color.hex2name, color.contrast_ratio, color.aatext, color.aaatext );
    });

  }else if("hex1"in body[0] && "hex2" in body[0]){
     body.forEach((entry, index) => {
      const i = index * 5;
      const color = entry as ColorContrastType
      placeholders.push(`($${i + 1}, $${i + 2}, $${i + 3}, $${i + 4}, $${i + 5})`);
      values.push(color.hex1, color.hex2, color.contrast_ratio, color.aatext, color.aaatext );
    });

  }
  return {values,placeholders}

}
router.post('/:route', async(req: Request,res: Response):Promise<void>=>{
  const {route} = req.params
  let result:QueryResult<any> |undefined
    try{
      const body = req.body as ColorBodyType | HexBodyType |ColorContrastType
       if(!body ||!Array.isArray(body)|| body.length === 0){
            res.status(400).json({ error: "Invalid array body or missing body", route: `${route}`});
          return;
          } 
        const {values, placeholders} = makeValuesAndPlaceHolder(body)
          if(!values || !placeholders){
               res.status(400).json({error: "Missing color name or closest named hex", })
          }
          const queryMap: Record<string,string> ={
          "named_colors": `INSERT INTO named_colors (name, closest_named_hex) VALUES ${placeholders.join(", ")}  ON CONFLICT DO NOTHING RETURNING *;`,
          "hex_variants": `INSERT INTO hex_variants(hex,closest_named_hex, clean_hex) VALUES ${placeholders.join(", ")} ON CONFLICT DO NOTHING RETURNING *;`,
          "color_contrasts":`INSERT INTO color_contrasts(hex1,hex2,contrast_ratio, aatext, aaatext) VALUES ${placeholders.join(", ")} ON CONFLICT DO NOTHING RETURNING *;`,
          "saved_user_color_schemes":`INSERT INTO saved_user_color_schemes(user_id,scheme_name, hex1,hex1name, hex2,hex2name,contrast_ratio, aatext, aaatext) VALUES ${placeholders.join(", ")} ON CONFLICT DO NOTHING RETURNING *;`
        }
       
        result = await pool.query(queryMap[route],values)
      
        if(!result){
          res.status(400).json({error:"Unknown Route"})
          return
        }
        if(result.rows.length == 0){
         // console.log(result.rows.length,  "THE LENGTH")
         //  console.log(queryMap[route], body,"BODYY", body.length, values, "I  DO NNOT UNDERSYAND")
          res.status(200).json({message:"array is short", found: true, body: body, other:queryMap[route], val:values})}
            else{ 
              res.status(201).json(result.rows)
              }
    }catch(err: any) {
      if(err.code && typeof err.code == "string"){
        if (errorResponses[err.code]  ) {
       res.status(200).json({ message: errorResponses[err.code] , found:true}); 
        }
      }
      else{
      res.status(404).json({message:"UNKNOWN ERROR",request:req.body, err:err, route: route})
    } 
  }
})
const selectExplained = `SELECT 
  CASE 
    WHEN cc.hex1 = $1 THEN cc.hex2
    ELSE cc.hex1
  END AS hex,

  cc.contrast_ratio,
  cc.aatext,
  cc.aaatext,
  nc.name,
  hv.closest_named_hex,
  hv.clean_hex

FROM color_contrasts cc

JOIN hex_variants hv 
  ON (
    (cc.hex1 = $1 AND cc.hex2 = hv.hex)
    OR
    (cc.hex2 = $1 AND cc.hex1 = hv.hex)
  )

JOIN named_colors nc 
  ON nc.closest_named_hex = hv.closest_named_hex

WHERE cc.hex1 = $1 OR cc.hex2 = $1;
`
router.get("/:route",async(req: Request, res:Response): Promise<void>=>{
  const {route} = req.params
  const {closest} =req.query
  try{
    let result: QueryResult<any> |undefined
    const queryMap: Record<string,string> ={
      "named_colors": `SELECT * FROM named_colors WHERE closest_named_hex = $1`,
      "hex_variants":`SELECT hv.hex,nc.closest_named_hex, nc.name, hv.clean_hex 
        FROM named_colors nc JOIN hex_variants hv 
        ON nc.closest_named_hex = hv.closest_named_hex WHERE hv.hex = $1`,
        "color_contrasts":selectExplained,
        "saved_user_color_schemes": `SELECT ss.scheme_name, ss.hex1, ss.hex1name, ss.hex2, ss.hex2name, ss.contrast_ratio, ss.aatext, ss.aaatext FROM saved_user_color_schemes ss where ss.id = $1`

    }
      result = await pool.query(queryMap[route],[closest])
      if(!result){
          res.status(400).json({error:"Unknown Route"})
          return
        }
        if(result.rows.length == 0 ){ 
        res.status(200).json({message:"NO colors with hex found",hex: closest, found:false})
      }else if(result.rows.length >= 1){
         res.status(200).json({results:result.rows, message:"hex was found", found:true})
      }
  }catch(err:any){
   res.status(500).json({error: "SOmething went wrong"})
  }
})

export default router