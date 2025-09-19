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
export type DeleteUserColorSchemeType={
    user_id:string,
    hex1:string,
    hex2:string,
}
export type UpdateUserColorSchemeNameType={
  user_id:string,
  scheme_name:string,
    hex1:string,
    hex2:string,
}
const errorResponses: Record<string, string>={
'23505': 'Color already exists',
'23503':'Color messes with table constraint',
'23502': 'Not null violation',
}
///tells router to handle posts requests in the route /colors
type AllPossibleBodyTypes =  HexBodyType | ColorBodyType |ColorContrastType | UpdateUserColorSchemeNameType 
| DeleteUserColorSchemeType | SavedUserColorSchemeType;
const createPlaceHolders=(count:number, start:number =1 )=>{
  //num is index, back to the example below, if start is 1, andd count is 3
  const placeHolders = Array.from({length:count},(el,num)=>`$${start+num}`)
  return `(${placeHolders.join(", ")})`
}
const makeValuesAndPlaceHolder =<T extends AllPossibleBodyTypes>(body:T[] )=>{
  const schemas= {
    ColorBody:["name","closest_named_hex"],
    HexBody:["hex","closest_named_hex","clean_hex"],
    SaveUserColorSchemeBody: ["user_id", "scheme_name", "hex1", "hex1name",
      "hex2", "hex2name", "contrast_ratio", "aatext", "aaatext"],
      UpdateUserColorSchemeBody:["user_id", "scheme_name", "hex1","hex2"],
      DeleteUserColorSchemeBody:["user_id", "hex1","hex2"],
      ColorContrastBody:["hex1","hex2","contrast_ratio","aatext","aaatext"]
  }
let currentSchema: keyof typeof schemas | undefined;
 const bodyKeys = Object.keys(body[0])
  for(const schema in schemas){
    const schemaKeys = schemas[schema as keyof typeof schemas]
   if(bodyKeys.every((key)=>schemaKeys.includes(key))){
    currentSchema = schema as keyof typeof schemas
   }
  }     
if (!currentSchema) throw new Error("Unknown schema for body");
  const schemaKeys = schemas[currentSchema]
    const values: (string | number | boolean)[] = [];
  const placeholders: string[] = [];
    body.forEach((entry, index) => {
      //explantionn for myself
      //the index is 0 for example, the curent scheme is  hexbody meaning the length is 3, so start is 1
      const start = index * schemaKeys.length +1;
      placeholders.push(createPlaceHolders(schemaKeys.length,start));
      schemaKeys.forEach((key )=>{
        values.push(entry[key as keyof T] as boolean| number|string );
      })
    });
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
       "saved_user_color_schemes": `
        SELECT scheme_name, hex1, hex1name, hex2, hex2name, contrast_ratio, aatext, aaatext
          FROM saved_user_color_schemes
                        WHERE user_id = $1 ORDER BY updated_at DESC, created_at DESC`
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
router.delete("/:route",async(req:Request,res:Response):Promise<void>=>{
   const {route} = req.params

     try{
      const body = req.body as AllPossibleBodyTypes
       if(!body ||!Array.isArray(body)|| body.length === 0){
            res.status(400).json({ error: "Invalid array body or missing body", route: `${route}`});
          return;
          } 
        const {values, placeholders} = makeValuesAndPlaceHolder(body)
          if(!values || !placeholders){
               res.status(400).json({error: "Missing color name or closest named hex", })
          }
          const queryMap: Record<string,string> ={
          "saved_user_color_schemes": `
        DELETE FROM saved_user_color_schemes
        WHERE user_id = $1 AND hex1 = $2 AND hex2 = $3
        RETURNING *
      `
        }
           if (!queryMap[route]) res.status(400).json({ error: "Unknown route" });
          const result = await pool.query(queryMap[route],values)
      
        if(!result){
          res.status(400).json({error:"Unknown Route"})
        }
    if (result.rows.length === 0) {
      res.status(200).json({ message: "No matching colors found", found: false });
    } else {
      res.status(200).json({ message: "Deleted successfully", deleted: result.rows, found: true });
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
router.patch("/:route",async(req:Request,res:Response):Promise<void>=>{
   const {route} = req.params

     try{
      const body = req.body as AllPossibleBodyTypes
       if(!body ||!Array.isArray(body)|| body.length === 0){
            res.status(400).json({ error: "Invalid array body or missing body", route: `${route}`});
          return;
          } 
        const {values, placeholders} = makeValuesAndPlaceHolder(body)
          if(!values || !placeholders){
               res.status(400).json({error: "Missing color name or closest named hex", })
          }
          const queryMap: Record<string,string> ={
          "saved_user_color_schemes": `
          UPDATE saved_user_color_schemes
          SET scheme_name = $2
          WHERE user_id = $1
            AND hex1 = $3
            AND hex2 = $4
            RETURNING *;
            `
        }
           if (!queryMap[route]) res.status(400).json({ error: "Unknown route" });
          const result = await pool.query(queryMap[route],values)
        if(!result){
          res.status(400).json({error:"Unknown Route"})
        }
    if (result.rows.length === 0) {
      res.status(200).json({ message: "No matching colors found", found: false });
    } else {
      res.status(200).json({ message: "Updated successfully", updated: result.rows, found: true });
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

export default router

