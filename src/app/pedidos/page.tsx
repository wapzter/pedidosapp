'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, User, Package } from 'lucide-react'
import { collection, query, where, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Tipos
interface Articulo {
  codigo: string;
  codigoalterno?: string;
  descripcion: string;
  medida?: string;
  minimo?: number;
  empleado?: string;
}

interface PedidoItem extends Articulo {
  empleado: string;
  fechaAgregado: Date;
}

const empleados = ["Dario", "Victor", "Emilio", "Alan"]

export default function SistemaPedidos() {
  const [codigo, setCodigo] = useState("")
  const [articuloActual, setArticuloActual] = useState<Articulo | null>(null)
  const [pedidoActual, setPedidoActual] = useState<PedidoItem[]>([])
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState("")
  const [pedidoActualId, setPedidoActualId] = useState<string | null>(null)

  useEffect(() => {
    cargarPedidoActual()
  }, [])

  const cargarPedidoActual = async () => {
    try {
      const pedidosRef = collection(db, 'pedidos')
      const q = query(pedidosRef, where('estado', '==', 'abierto'))
      const querySnapshot = await getDocs(q)
      
      if (!querySnapshot.empty) {
        const pedidoDoc = querySnapshot.docs[0]
        setPedidoActualId(pedidoDoc.id)
        setPedidoActual(pedidoDoc.data().items || [])
      } else {
        const fecha = new Date()
        const pedidoId = fecha.toISOString().split('T')[0].replace(/-/g, '')
        const nuevoPedido = {
          id: pedidoId,
          fecha: fecha,
          items: [],
          estado: 'abierto'
        }
        const docRef = await addDoc(collection(db, 'pedidos'), nuevoPedido)
        setPedidoActualId(docRef.id)
      }
    } catch (error) {
      console.error('Error al cargar pedido:', error)
    }
  }

// ... resto del código igual ...

const buscarArticulo = async (e: React.FormEvent) => {
  e.preventDefault()
  try {
    console.log('Buscando artículo con código:', codigo)
    
    const articulosRef = collection(db, 'articulos')
    const q = query(articulosRef, where('codigo', '==', codigo.toString()))
    const querySnapshot = await getDocs(q)
    
    if (!querySnapshot.empty) {
      const articulo = querySnapshot.docs[0].data() as Articulo
      setArticuloActual(articulo)  // 👈 Cambiado aquí
    } else {
      const qNum = query(articulosRef, where('codigo', '==', parseInt(codigo)))
      const querySnapshotNum = await getDocs(qNum)
      
      if (!querySnapshotNum.empty) {
        const articulo = querySnapshotNum.docs[0].data() as Articulo
        setArticuloActual(articulo)  // 👈 Y aquí
      } else {
        console.log('No se encontró el artículo')
        alert("Artículo no encontrado")
      }
    }
  } catch (error) {
    console.error('Error al buscar artículo:', error)
    alert("Error al buscar artículo")
  }
}

// ... resto del código igual ...




  return (
    <div className="container mx-auto p-4 bg-gray-50 min-h-screen">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800">Sistema de Pedidos</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="shadow-lg">
          <CardHeader className="bg-yellow-400">
            <CardTitle className="flex items-center text-black">
              <Search className="w-5 h-5 mr-2" />
              Buscar Artículo
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={buscarArticulo} className="flex gap-2">
              <Input
                type="text"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                placeholder="Código del artículo"
                className="flex-grow"
              />
              <Button 
                type="submit" 
                className="bg-yellow-400 text-black hover:bg-yellow-500"
              >
                Buscar
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader className="bg-black text-white">
            <CardTitle className="flex items-center">
              <User className="w-5 h-5 mr-2" />
              Seleccionar Empleado
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <Select onValueChange={setEmpleadoSeleccionado} value={empleadoSeleccionado}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecciona un empleado" />
              </SelectTrigger>
              <SelectContent>
                {empleados.map((emp) => (
                  <SelectItem key={emp} value={emp}>
                    {emp}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg mb-8">
        <CardHeader className="bg-gray-200">
          <CardTitle className="flex items-center text-gray-800">
            <Package className="w-5 h-5 mr-2" />
            Artículos del Pedido
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {articuloActual && (
            <div className="mb-6 bg-yellow-50 p-4 rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Código Alterno</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Medida</TableHead>
                    <TableHead>Mínimo</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>{articuloActual.codigo}</TableCell>
                    <TableCell>{articuloActual.codigoalterno}</TableCell>
                    <TableCell>{articuloActual.descripcion}</TableCell>
                    <TableCell>{articuloActual.medida}</TableCell>
                    <TableCell>{articuloActual.minimo}</TableCell>
                    <TableCell>
                      <Button 
                        onClick={agregarAlPedido} 
                        size="sm" 
                        className="bg-green-500 hover:bg-green-600 text-white"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Agregar
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          )}

          {pedidoActual.length > 0 && (
            <div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Código Alterno</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Medida</TableHead>
                    <TableHead>Mínimo</TableHead>
                    <TableHead>Empleado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pedidoActual.map((item, index) => (
                    <TableRow key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <TableCell>{item.codigo}</TableCell>
                      <TableCell>{item.codigoalterno}</TableCell>
                      <TableCell>{item.descripcion}</TableCell>
                      <TableCell>{item.medida}</TableCell>
                      <TableCell>{item.minimo}</TableCell>
                      <TableCell>{item.empleado}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {pedidoActual.length === 0 && !articuloActual && (
            <div className="text-center text-gray-500 py-8">
              <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p>No hay artículos en el pedido actual. Busca y agrega artículos para comenzar.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}