'use client'
import { useNotification } from "@/app/providers/notificationProvider";
import Button from "../../button";
import { useEffect, useState } from "react";
import { FaEdit } from "react-icons/fa";
import { MdAdd } from "react-icons/md";
import { useApi } from "@/app/hooks/api";

interface SearchCustomerProps {
    setCustomer: (customer: Customer) => void;
    customer: Customer
    setLoading: (value:boolean) => void;
    isEditable: boolean
}

const SearchCustomer = ({setCustomer,customer,setLoading,isEditable}:SearchCustomerProps) => {
    const [nationality,setNationality] = useState("V");
    const [ci,setCi] = useState("")
    const [isDisabled,setIsDisabled] = useState(true)
    const [isPressed,setIsPressed] = useState(true)
    const [isCreated,setIsCreated] = useState(true)

    const {showNotification,closeNotification} = useNotification()
    const searchCustomer = async ()=>{
        closeNotification()
        if (!nationality){
            showNotification({message:"Ingresa una nacionalidad",type:"error"})
            return
        }
        if (ci.length < 7 || ci.length>8){
            showNotification({message:"Cedula Invalida",type:"error"})
            return
        }
        showNotification({message:"Buscando...",type:"info"})
        const params = new URLSearchParams({url:"/customers/get_customer_by_ci/"+nationality+"-"+ci})
        const response = await fetch("/api/get?"+params)
        if (response.ok){
            const data = await response.json()
            setCustomer(data)
            setIsPressed(false)
            setIsCreated(false)
        }else{
            setCustomer({
                id:0,
                ci:nationality+"-"+ci,
                name:"",
                lastname:"",
                phone_number:"",
                address:""
            })
            showNotification({message:"Cliente no encontrado",type:"error"})
            setIsPressed(false)
            return
        }
        closeNotification()
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { id, value } = e.target;
        const valueCustomer = {
            ...customer,
            [id]:value
        } as Customer
        setCustomer(valueCustomer)

    };

    useEffect(()=>{
        setCustomer({
            id:0,
            ci:"",
            name:"",
            lastname:"",
            phone_number:"",
            address:""
        })
        setIsPressed(true)
        setIsDisabled(true)
        setIsCreated(true)
    },[ci,nationality])

    const {
        update,
        create
    } = useApi<Customer>({resourceName:"Cliente"})

    const saveCustomer = async ()=>{
        setLoading(true)
        if (customer.name.length < 4 || customer.lastname.length < 4){
            showNotification({message:"El nombre y el apellido deben tener 4 caracteres o mas.",type:"error"})
            setLoading(false)
            return
        }
        if (!customer.phone_number){
            showNotification({message:"El numero de telefono es requerido.",type:"error"})
            setLoading(false)
            return
        }
        if (isCreated){
            await create(customer,{url:"/customers/create_customer"})
            setCustomer({...customer,id:-1})
        }else{
            await update(customer,{url:"/customers/update_customer/"+customer.id.toString()})
        }
        setLoading(false)

    }
    useEffect(()=>{
        console.log(customer)
        if (customer.id!=0){
            setCi(customer.ci.split("-")[1])
            setNationality(customer.ci.split("-")[0])
        }
    },[customer])

    return (
        <>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mt-6 pb-1 mb-1">Buscar Cliente</h3>
            <div className="flex flex-col sm:flex-row gap-3 items-end justify-between">
                <div className='w-full sm:w-auto'>
                    <label htmlFor="current-nationality" className="block text-sm font-medium text-gray-700 mb-1">NACIONALIDAD:</label>
                    <select
                        id="current-nationality"
                        value={nationality}
                        onChange={e => {setNationality(e.target.value)}}
                        className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base transition-all duration-200 ease-in-out"
                    >
                        <option value="V">V</option>
                        <option value="E">E</option>
                    </select>
                </div>
                <div className="flex-1/2 w-full sm:w-auto">
                    <label htmlFor="ci" className="block text-sm font-medium text-gray-700 mb-1">Cedula</label>
                    <input
                        type="number"
                        id="ci"
                        value={ci}
                        onChange={(e) => setCi(e.target.value)}
                        min="1000000"
                        max="99999999"
                        className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base transition-all duration-200 ease-in-out"
                    />
                </div>
                <Button
                    onClick={searchCustomer}
                    type="button"
                    className="w-full flex-1/12 sm:w-auto bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md mt-4 sm:mt-0 shadow-sm transition-all duration-200 ease-in-out"
                >
                    BUSCAR
                </Button>
            </div>
            
            <div className="flex justify-between items-end">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mt-6 pb-1 mb-1">Datos Cliente</h3>
                <Button
                    type="button"
                    id="button-change"
                    onClick={()=>setIsDisabled(!isDisabled)}
                    disabled={isPressed}
                    className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-md h-[80%] disabled:bg-blue-400 disabled:cursor-auto"
                >
                    {isCreated ?<MdAdd /> :<FaEdit />}
                    <span>{isCreated ? "Crear": "Modificar"}</span>
                </Button>

            </div>
            <div className='grid grid-cols-2 gap-3'>
                <div className="w-full sm:w-auto">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                    <input
                        type="text"
                        id="name"
                        value={customer.name}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base transition-all duration-200 ease-in-out disabled:bg-indigo-50"
                        disabled={isDisabled}
                    />
                </div>
                <div className="w-full sm:w-auto">
                    <label htmlFor="lastname" className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
                    <input
                        type="text"
                        id="lastname"
                        value={customer.lastname}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base transition-all duration-200 ease-in-out disabled:bg-indigo-50"
                        disabled={isDisabled}
                    />
                </div>
                <div className="w-full sm:w-[80%] col-span-2 justify-self-center">
                    <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-1">Numero de Telefono</label>
                    <input
                        type="text"
                        id="phone_number"
                        value={customer.phone_number}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base transition-all duration-200 ease-in-out disabled:bg-indigo-50"
                        disabled={isDisabled}
                    />
                </div>
                <div className='col-span-2'>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Direccion</label>
                    <textarea
                        id="address"
                        name="address"
                        value={customer.address}
                        onChange={handleChange}
                        rows={2}
                        disabled={isDisabled}
                        className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-indigo-50"
                    ></textarea>
                </div>
                {!isDisabled && (
                    <div className='col-span-2 justify-self-center'>
                    <Button
                        onClick={saveCustomer}
                        type="button"
                        className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white p-2 rounded-md h-[80%] disabled:bg-blue-400 disabled:cursor-auto"
                    >
                        {isCreated ?<MdAdd /> :<FaEdit />}
                        <span>GUARDAR</span>
                    </Button>
                    </div>
                )}
            </div>
        </>
    )
}

export default SearchCustomer;