Debemos tener instalado nodejs y nodemon
1- Creamos las carpetas
    * public para el frontend con todo lo que el usuario puede ver en su computadora.
    * src donde estaran nuestros archivos del backend que reciben o envian peticiones HTTP, pero el usuario no puede acceder directamente. Sus procesos suceden en el servidor.
    * server.js es la entrada al sitio web

2- Creo los archivos del public de manera estandar como archivo común html-css-js
3- Para que arranque como nodejs. Lo inicializo con
    npm init
4- Le cargo las librerias básicas como express(para las peticiones HTTP) , dotenv(para tener un archivo de variables de entorno secretas) y mongoose (para el manejo de las bases de datos)
 npm i express dotenv mongoose
5- Agrego el "dev" para que pueda ir viendo los cambios que suceden al programar en el package.json
6- Programo el servidor
7- Voy a usar npm i express-rate-limit bcryptjs jsonwebtoken

8- Para subirlo
Primero creo el .gitignore en mi carpeta
9- En mi cuenta que abrí gratis en github, creo un repositorio

copio lo que me dice el sistema en mi computadora

git init
git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/codigoenweb/footer.git
git push -u origin main

10- Creo una cuenta en render con mi email o con github, así estan conectados
11- En web services hago el deploy