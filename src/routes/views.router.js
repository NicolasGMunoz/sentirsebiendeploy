import { Router } from "express";
import UserManager from "../manager/userManager.js";
import ComentarioManager from "../manager/comentarioManager.js";
import TurnosManager from "../manager/turnosManager.js"
import { __dirname } from "../utils.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import {promisify} from "util";
import { isAuthenticated, isAdmin  } from "../manager/userManager.js";

const router = Router()
const userManager = new UserManager();
const comentarioManager = new ComentarioManager();
const turnosManager = new TurnosManager();
dotenv.config()



//index
router.get('/', async (req, res) => {
    try {
        res.render("index");
    } catch (error) {
        res.render("index", {error: error.message})
    }
})


// login
router.get("/login", async (req, res) => {
    if(req.cookies.jwt){
        try {
            const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRETO)
            if(decoded.id){
                return res.redirect("index");
            }else{
                res.render("login");
            }
    
        } catch (error) {
            console.log("error");
            res.status(500).send("Error interno del servidor"); 
        }
    }else{
        res.render("login");
            
    }
    

});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        
        const existingUser = await userManager.getUserByUser(username)
        if(!existingUser){
            res.status(401).send("Usuario no encontrado");
        }
        // Comparar la contraseña proporcionada con la almacenada en la base de datos    
        else if (existingUser.password != password) {
            return res.json({ success: false, message: 'Contraseña incorrecta' });
        }
        // Si todo es correcto, puedes establecer una sesión, token o simplemente redirigir
        else{
            const id = existingUser.idusuario
            const token = jwt.sign({ id:id }, process.env.JWT_SECRETO, {expiresIn: process.env.JWT_TIEMPO_EXPIRACION})
            const cookieOptions = {
                expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRACION*24*60*60*1000),
                httpOnly: true};
                res.cookie('jwt', token, cookieOptions)
                res.status(200).json({ success: true, message: 'Bienvenido' });
            }
    
    } catch (error) {
        console.error('Error en la consulta:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});


//notices
router.get("/notices", (req,res) =>{
    try {
        res.render("notices");
    } catch (error) {
        console.log(error);
        res.status(500).send("Error interno");        
    }
    });
    
router.post('/notices', async(req,res)=>{
    const { text } = req.body
    console.log(text)
    if (!text) {
        return res.status(400).json({ success: false, message: 'El comentario no puede estar vacío.' });
    }
    try {
        await comentarioManager.addComentario({text});
    res.json({success: true, message: "Comentario agregado"})
    } catch (error) {
        console.log(error);
        res.status(500).send("Error interno"); 
    }});



//register
router.get("/register",(req, res) => {  // Agregué `req` como primer parámetro
    try {
        res.render("register");
    } catch (error) {
        console.log("error");
        res.status(500).send("Error interno del servidor");  
    }
});

router.post("/register", async (req,res) =>{
    const {username, password, email, nombre} = req.body;
    if( !username || !password || !email){
        return res.status(400).json({success:false, message: "Completar todos los campos"})   
    }
    try {
        const existingUser = await userManager.getUserByEmail(email);
        if(existingUser){
            return res.status(400).json({success:false, message: "El nombre de usuario ya está registrado"})
            }
        
        await userManager.addUser({ username, password, email, nombre})   
        res.json({success:true, message: "Usuario creado con éxito"})
    } catch (error) {
        console.error("Error al intentar registrarse", error);
        res.status(500).json({ success: false, message: "Error en la conexion con el servidor" })
    }
 } )


// turnos
router.get("/turnos",isAuthenticated, async (req, res) => {  // Agregué `req` como primer parámetro
    try {
        await res.render("turnos");  // Corregí la ruta a minúsculas
    } catch (error) {
        console.log("error");
        res.status(500).send("Error interno del servidor");  // Agregué un mensaje de error
    }
});
router.post('/turnos', async (req, res) => {
    const { fechayhora, servicio, nombre, profesional } = req.body;

    if(!nombre || !servicio || !fechayhora || !profesional){
      return res.status(400).send('Faltan campos');
    }
    try {
      const existingTurno = await turnosManager.getTurnosporFecha(fechayhora)
      if(existingTurno)
        { return res.status(400).json({success:false, message: "El turno ya está registrado"})}

    await turnosManager.addTurno({nombre, fechayhora, servicio, profesional})
    res.json({success:true, message: "Turno agregado con éxito"})
    } catch (error) {
      console.log("Error al intentar agregar turno", error)
      res.status(500).send("Error interno del servidor")
    }

  });


//aboutUs
  router.get("/aboutUs",(req, res) => {  // Agregué `req` como primer parámetro
    try {
        res.render("aboutUs");
    } catch (error) {
        console.log("error");
        res.status(500).send("Error interno del servidor");  // Agregué un mensaje de error
    }
});


//employedForm
router.get("/employedForm",(req, res) => {  // Agregué `req` como primer parámetro
    try {
        res.render("employedForm");  // Corregí la ruta a minúsculas
    } catch (error) {
        console.log("error");
        res.status(500).send("Error interno del servidor");  // Agregué un mensaje de error
    }
});


//services
router.get("/services",(req, res) => {  // Agregué `req` como primer parámetro
    try {
        res.render("services");   // Corregí la ruta a minúsculas
    } catch (error) {
        console.log("error");
        res.status(500).send("Error interno del servidor");  // Agregué un mensaje de error
    }
});


//turnosCargados
router.get("/turnosCargados",isAdmin,(req, res) => {  
    try {
        
        res.render("turnosCargados");
    } catch (error) {
        console.log("error");
        res.status(500).send("Error interno del servidor");  
    }
});
export default router