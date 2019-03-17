## Facturación Eléctrica

- Autor: Carlos Fernández Durán
- Tecnologías, englobadas en el stack [MEAN](http://mean.io/):
    - BBDD: [MongoDB](https://www.mongodb.com/)
    - API: [Express](https://expressjs.com/)
    - Frontend: [Angular](https://angular.io/), usando [Bootstrap](https://getbootstrap.com/) como framework para la maquetación.
    - Backend: [NodeJS](https://nodejs.org)

### Objetivo de la prueba

Desarrollar una aplicación que registre datos de facturación eléctrica importando valores desde un fichero CSV, con datos ficticios, almacenándolos en una base de datos, mostrándolos en una tabla y permitiendo realizar operaciones CRUD.

### Aplication deploy

#### Pre-requisitos

* node.js - [Descargar](https://nodejs.org/en/download/) .  
* npm - viene con node.  
* mongodb - [Descargar](https://www.mongodb.com/download-center/community).

#### Instalación y despliegue
```
npm install
npm run build (para compilar la aplicación Angular, esto tarda unos 20 segundos)
npm run serve (para iniciar el servidor node)
```
Abrir [http://localhost:4040/](http://localhost:4040/) en el navegador para ver la aplicación.

#### Observaciones de la aplicación

- Al iniciar el servidor, la aplicación limpia la base de datos e importa valores para los meses de diciembre de 2018 y enero de 2019 (alojados en la carpeta [/docs](/docs))
- La base de datos ha sido llamada *carlosfernandezduran* para facilitar su búsqueda y evitar coincidencias.
- Puede importar más datos utilizando el fichero [/docs/consumo-2019-02.csv](/docs/consumo-2019-02.csv)
- Al importart datos, si la fecha coincide con algunas de las entradas de la BBDD, los demás valores serán sobreescritos.
- Tanto las gráficas como la tabla son actualizadas al editar/agregar/borrar o importar datos.

#### Ejecutar test unitarios
````
npm test
````


