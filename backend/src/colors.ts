import express from "express"
import { pool } from "./db"
import type { Request,Response, Router } from "express"

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
///tells router to handle posts requests in the route /colors
function delay(ms: number) {
            return new Promise((resolve) => {setTimeout(resolve, ms)});
}

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
  const {route, body} = req.params
  
    try{
        let result
        if(route == "named_colors"){
          const body = req.body as ColorBodyType[]
         
          if(!Array.isArray(body)|| body.length === 0){
            res.status(400).json({ error: "Invalid array body", route: `${route}`});
          return;

          }
           const {values, placeholders} = makeValuesAndPlaceHolder(body)
          if(!values || !placeholders){
               res.status(400).json({error: "Missing color name or closest named hex", })
          }else{
           const query = 
            `INSERT INTO named_colors (name, closest_named_hex) VALUES ${placeholders.join(", ")}  ON CONFLICT DO NOTHING RETURNING *;`
            
        const result = await pool.query(query,values)
       if(result.rows.length == 0){res.status(200).json({message:"array is too short", found: true})}
            else{
                res.status(201).json(result.rows)
              }
          }
        }else if(route =="hex_variants"){
          const body = req.body as HexBodyType[]
           if(!Array.isArray(body)|| body.length === 0){
            res.status(400).json({ error: "Invalid array body", route: `${route}` });
          return;

          }
           const {values, placeholders} = makeValuesAndPlaceHolder(body)
          if(!values || !placeholders){
               res.status(400).json({error: "Missing color name or closest named hex", })
          }
          
          else{
           const query = `INSERT INTO hex_variants(hex,closest_named_hex, clean_hex) VALUES ${placeholders.join(", ")} ON CONFLICT DO NOTHING RETURNING *;`
            const result = await pool.query(query, values)
           if(result.rows.length == 0){res.status(200).json({message:"array is too short", found: true})}
           else{
                res.status(201).json(result.rows)
              }

          }
        }else if(route == "color_contrasts"){
          const body = req.body as ColorContrastType[]
           if(!Array.isArray(body)|| body.length === 0){
            res.status(400).json({ error: "Invalid array body", route: `${route}` });
          return;
          }
          if(!body){
            res.status(400).json({error:"Missing body"})
            throw new Error("error ocurred in body of color_contrasts") 
          }
           const {values, placeholders} = makeValuesAndPlaceHolder(body)
          if(!values || !placeholders){
               res.status(400).json({error: "Missing color name or closest named hex", })
          }
          else{
          const  query =`INSERT INTO color_contrasts(hex1,hex2,contrast_ratio, aatext, aaatext) VALUES ${placeholders.join(", ")} ON CONFLICT DO NOTHING RETURNING *;`
              const result = await pool.query(query,values)
              if(result.rows.length == 0){res.status(200).json({message:"array is too short", found: true})}
              else{
                res.status(201).json(result.rows)

              }
            
          }

        }
        

    }catch(err: any) {
      if(route == "color_contrasts")console.log("found culprit")
    if (err.code === '23505') {
      // 23505 is PostgreSQL's "unique violation" error code
     // console.error("this error happened?", route, err)
     if(route == "color_contrasts")console.log("found culprit")
       res.status(200).json({ message: 'Color already exists', found:true});
       
    }else if(err.code == '23503'){
      res.status(200).json({ message: 'Color messes with table constraint',found:true });

    }else if(err.code == '23502'){
      res.status(200).json({ message: 'NOt null violation', });
    }else if(err.code == '23505'){
      res.status(200).json({ message: 'unique constraint is violation.Application is trying to insert a duplicate value into a column that has a unique constraint.', });
    }else{
      console.error("SOMETHING WORNG",err.code)
      res.status(404).json({message:"UNKNOWN ERROR", err:err, route: route})
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
  let isFetching
  const {route} = req.params
  
  const {closest} =req.query
  
  try{
    if(route == "named_colors"){
     // console.log(closest,route, "CLOSET?")
     // console.log(req,"REQ")
      isFetching = true
     
      //console.log(isFetching)
     const result = await pool.query(`SELECT * FROM named_colors WHERE closest_named_hex = $1`,[closest])
      if(result.rows.length === 0){
       res.status(200).json({message:"NO colors with closest hex found", found:false})
      }else if(result.rows.length >= 1)res.status(200).json({results:result.rows, message:"COLOR WAS FOUND",found:true})
    }else if(route == "hex_variants"){
      const result = await pool.query(`SELECT hv.hex,nc.closest_named_hex, nc.name, hv.clean_hex 
        FROM named_colors nc JOIN hex_variants hv 
        ON nc.closest_named_hex = hv.closest_named_hex WHERE hv.hex = $1`,[closest])
       // console.log(closest, "awwww")
      if(result.rows.length == 0 ){ 
        //console.log(closest, result.rows, "awwww")
        res.status(200).json({message:"NO colors with hex found", found:false})
      }else if(result.rows.length >= 1){
         res.status(200).json({results:result.rows[0], message:"hex was found", found:true})
      }
  }else if(route == "color_contrasts"){
   

      const result = await pool.query(selectExplained,[closest])
      if(result.rows.length == 0 ){ 
        res.status(200).json({message:"NO colors with hex found", found:false})
      }else if(result.rows.length >= 1){
         res.status(200).json({results:result.rows, message:"hex was found", found:true})
      }
     
  }

  }catch(err:any){
    console.log("what???")
    console.error("something went wronff", err)
   res.status(500).json({error: "SOmething went wrong"})
  }finally{
    isFetching = false
    //console.log("get request stopped")
    
  }

})

export default router