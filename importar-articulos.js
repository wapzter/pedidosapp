const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc } = require('firebase/firestore');
const fs = require('fs');

const firebaseConfig = {
  apiKey: "AIzaSyD95oJkYGsbzwZSMHFp3mdbUtkMJQMR124",
  authDomain: "fmacy-9a354.firebaseapp.com",
  projectId: "fmacy-9a354",
  storageBucket: "fmacy-9a354.firebasestorage.app",
  messagingSenderId: "187632516527",
  appId: "1:187632516527:web:36e81153ffc1c8ef4b435a"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Lee el archivo JSON
const articulos = require('./productos.json');

async function importarArticulos() {
  for (const articulo of articulos) {
    try {
      // Limpia y convierte los datos
      const articuloFormateado = {
        codigo: articulo.codigo.toString(), // Convertimos a string para consistencia
        codigoAlterno: articulo.codigoalt,
        descripcion: articulo.descripcion,
        minimo: Number(articulo.minimo),
        medida: articulo.pieza,
        precio: Number(articulo.precio.replace('$', '')) // Quita el $ y convierte a número
      };

      await addDoc(collection(db, 'articulos'), articuloFormateado);
      console.log(`Artículo agregado: ${articuloFormateado.codigo}`);
    } catch (error) {
      console.error(`Error al agregar artículo ${articulo.codigo}:`, error);
    }
  }
  console.log('Importación completada');
}

importarArticulos();