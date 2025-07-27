'use client';
import React, { useState, useEffect } from 'react';
import Button from '../../button';
import { useNotification } from '@/app/providers/notificationProvider';

interface OrderFormProps {
    onSave: (orderData: OrderCurrenciesCreation | OrderUpdateFormData, params: Record<string,string>) => Promise<void>; 
    onCancel: () => void;
    initialData?: Order | null; 
}

const BillingForm: React.FC<OrderFormProps> = ({ onSave, onCancel, initialData }) => {
    const [items,setItems] = useState<OrderItem[]>([]); 
    const [currencyItems,setCurrencyItems] = useState<OrderCurrencyItem[]>([]); 
    const [currencyItemsInOrder,setCurrencyItemsInOrder] = useState<OrderCurrencyItem[]>([]); 
    const [loading,setLoading] = useState(false)
    const [valueCurrency,setValueCurrency] = useState(1)
    const [currencies,setCurrencies] = useState<Currency[] | null>(null)
    const [currentCurrencyIdToAdd, setCurrentCurrencyIdToAdd] = useState<number | 0>(1);
    const [currentCurrencyQuantityToAdd, setCurrentCurrencyQuantityToAdd] = useState<number>(0.0);

    const {closeNotification,showNotification} = useNotification()


    useEffect(() => {
        if (initialData) {
            setLoading(true)
            const params = new URLSearchParams({
                url: `/orders/get_order_dishes/`+initialData.id
            });
            fetch(`/api/get?`+params, {
                method: 'GET'
            }).then(response=>response.json())
            .then((data: OrderWithDishes)=>{
                setItems(data.dishes.map(item => ({
                    dish: item.dish,
                    quantity: item.quantity
                })));
                
            }).finally(()=>setLoading(false))

            setLoading(true)
            const paramsCurrency = new URLSearchParams({
                url: `/orders/get_order_currencies/`+initialData.id
            });
            fetch(`/api/get?`+paramsCurrency, {
                method: 'GET'
            }).then(response=>response.json())
            .then((data: OrderWithCurrencies)=>{
                if (!data.currencies[0]){
                    return
                }
                setCurrencyItems(data.currencies.map(item => ({
                    currency: item.currency,
                    quantity: item.quantity
                })));
                setCurrencyItemsInOrder(data.currencies.map(item => ({
                    currency: item.currency,
                    quantity: item.quantity
                })));
                
            }).finally(()=>setLoading(false))
        }
    }, [initialData]); 

    useEffect(()=>{
        const params = new URLSearchParams({url:"/currencies/get_currencies"})
        setLoading(true)
        closeNotification()
        fetch("/api/get?"+params,{
            method:"GET"
        })
        .then(response=>response.json())
        .then(data=>{
            setCurrencies(data)
            setLoading(false)
        }).catch(rej=>{
            showNotification({message:"Error al cargar las divisas: "+rej,type:"error"})
            setLoading(false)
        })
    },[])


    const total = items.reduce((sum, item) => sum + (item.quantity * item.dish.price), 0);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        closeNotification();
        if (!currencies){
            return
        }

        const currencyDeleted: OrderCurrencyCreation[] = []
        for (const c of currencyItemsInOrder){
            if (!currencyItems.find(x=>x.currency.id==c.currency.id)){
                currencyDeleted.push({currency_id:c.currency.id,quantity:0})
            }
        }
        const orderData = {
            currencies: [...currencyDeleted,...currencyItems.map(x=>Object({currency_id:x.currency.id,quantity:x.quantity}))]
        }
        console.log(orderData)
        // return
        const remaining = ((total-(currencyItems.reduce((sum, item) => sum + (item.quantity/item.currency.exchange), 0))))
        for (const x of currencies){
            const r = parseFloat((remaining*x.exchange).toFixed(2))
            if (r > 0){
                if (!confirm("Existe un remantente en: "+x.name+", de: " +r+"\n¿Desea Continuar?")){
                    showNotification({message:"Agregue el valor total de la factura, queda remanente en: "+x.name,type:"error"})
                    return
                }
            }
        }
        setLoading(true)
        await onSave(orderData,{url:"/orders/update_currencies/"+initialData?.id});
        await onSave({state:"completed"},{url:"/orders/update_order/"+initialData?.id});
        setLoading(false)
    }

    const handleRemoveItem = (currencyID: number) => {
        // if (initialData){
        //     const itemDeleted = selectedItems.filter(item => item.dish.id == dishId)[0]
        //     const isItemUpdate = items.find(i=>i.dish.id==itemDeleted.dish.id)
        //     if (isItemUpdate){
        //         isItemUpdate.quantity=0
        //     }
        // }
        setCurrencyItems(prevItems => prevItems.filter(item => item.currency.id !== currencyID));
    };

    const handleAddItem = (id:number = 0,quantity:number = 0) => {
        closeNotification()
        
        if (!currentCurrencyIdToAdd && id==0) {
            showNotification({message:'Por favor, selecciona una divisa para añadir.',type:"error"});
            return;
        }
        if (currentCurrencyQuantityToAdd <= 0 && quantity==0) {
            showNotification({message:'La cantidad debe ser mayor que cero.',type:"error"});
            return;
        }

        const currencyToAdd = currencies?.find(currency => currency.id === (id!=0 ? id: currentCurrencyIdToAdd));

        const remaining = (
                (
                    (
                        total
                        -(currencyItems.reduce((sum, item) => sum + (item.quantity/item.currency.exchange), 0)) //lo que ya se ha cobrado
                    )
                        *(currencyToAdd?.exchange ? currencyToAdd.exchange : 1) // se multiplica para sacar el valor restante en la divisa seleccionada
                )
            ) - (quantity!=0 ? quantity : currentCurrencyQuantityToAdd) // lo que se va a cobrar
        if (parseFloat(remaining.toFixed(2)) < 0){
            showNotification({message:'No se puede cobrar mas de lo establecido.',type:"error"});
            return
        }

        if (currencyToAdd) {
            const existingItemIndex = currencyItems.findIndex(item => item.currency.id === currencyToAdd.id);
            if (existingItemIndex > -1) {
                setCurrencyItems(prevItems =>
                    prevItems.map((item, index) =>
                        index === existingItemIndex
                            ? { ...item, quantity: item.quantity + (quantity!=0 ? quantity : currentCurrencyQuantityToAdd) }
                            : item
                    )
                );
            } else {
                setCurrencyItems(prevItems => [
                    ...prevItems,
                    {
                        currency: currencyToAdd,
                        quantity: (quantity!=0 ? quantity : currentCurrencyQuantityToAdd),
                    }
                ]);
            }

            setCurrentCurrencyQuantityToAdd(1);
            setCurrentCurrencyIdToAdd(1)
        } else {
            showNotification({message:'Divisa no encontrada.',type:"error"});
        }
    };

    const handleAddRemaining = ()=>{
        const remaining = ((total-(currencyItems.reduce((sum, item) => sum + (item.quantity/item.currency.exchange), 0)))*valueCurrency).toFixed(2)
        const currency = currencies?.find(x=>x.exchange==valueCurrency)
        handleAddItem(currency?.id,parseFloat(remaining))
    }

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <p className="text-gray-700 text-lg sm:text-xl animate-pulse">
                Cargando...
            </p>
        </div>
    );

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white rounded-lg shadow-md border border-gray-200">
            {/* Sección de Datos del Pedido (Número de Mesa) */}
            <h3 className="text-lg text-center sm:text-xl font-semibold text-gray-800 pb-2 mb-4">Datos del Pedido</h3>
            
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mt-6 pb-2 mb-4">Platos del Pedido</h3>
            {/* Lista de Platos Seleccionados */}
            {items.length > 0 && (
                <div className="mt-6 border border-gray-200 rounded-md overflow-hidden shadow-sm overflow-x-auto"> 
                    <table className="min-w-full divide-y divide-gray-200 table-fixed">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase w-2/5">Plato</th>
                                <th className="px-4 py-2 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase w-1/5">Cantidad</th>
                                <th className="px-4 py-2 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase">Precio Unitario</th>
                                <th className="px-4 py-2 text-right text-xs sm:text-sm font-medium text-gray-500 uppercase">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {items.map((item) => (
                                <tr key={item.dish.id} className='select-none'>
                                    <td className="px-4 py-2 text-sm sm:text-base text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis">{item.dish.name}</td>
                                    <td className="px-4 py-2 text-sm sm:text-base text-gray-700 whitespace-nowrap">{item.quantity}</td>
                                    <td className="px-4 py-2 text-sm sm:text-base text-gray-700 whitespace-nowrap">${item.dish.price.toFixed(2)}</td>
                                    <td className="px-4 py-2 text-right text-sm sm:text-base text-gray-900 whitespace-nowrap">${(item.quantity * item.dish.price).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            <div className="text-right text-lg sm:text-xl font-bold text-gray-900 mt-4 pt-2 border-t border-gray-200">
                Total del Pedido: ${total.toFixed(2)}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 items-end">
                <div className='flex-1 w-full sm:w-auto'>
                    <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">DIVISA</label>
                    {currencies && (<select
                        id="current-currency"
                        name='currency'
                        value={currentCurrencyIdToAdd}
                        onChange={e => {setCurrentCurrencyIdToAdd(parseInt(e.target.value))}}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-700 text-sm sm:text-base transition-all duration-200 ease-in-out"
                    >
                        {currencies.map((currency) => (
                            <option key={currency.id} value={currency.id}>
                                {currency.name}
                            </option>
                        ))}
                    </select>)}
                </div>
                <div className="w-full flex-1 sm:w-auto">
                    <label htmlFor="currencyQuantity" className="block text-sm font-medium text-gray-700 mb-1">Cantidad</label>
                    <input
                        type="number"
                        id="currencyQuantity"
                        value={currentCurrencyQuantityToAdd || ""}
                        step="0.1"
                        onChange={(e) => {setCurrentCurrencyQuantityToAdd(parseFloat(e.target.value))}}
                        min="0.00"
                        className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base transition-all duration-200 ease-in-out"
                    />
                </div>
                <Button
                    onClick={()=>handleAddItem()}
                    type="button"
                    className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md mt-4 sm:mt-0 shadow-sm transition-all duration-200 ease-in-out"
                >
                    Añadir
                </Button>
            </div>

            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mt-6 pb-2 mb-4">Pago del Pedido</h3>
            {currencyItems.length > 0 && (
                <div className="mt-6 border border-gray-200 rounded-md overflow-hidden shadow-sm overflow-x-auto"> 
                    <table className="min-w-full divide-y divide-gray-200 table-fixed">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase w-2/5">DIVISA</th>
                                <th className="px-4 py-2 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase w-2/5">Cantidad</th>
                                <th className="px-4 py-2 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase">Cambio</th>
                                <th className="px-4 py-2 text-center text-xs sm:text-sm font-medium text-gray-500 uppercase min-w-[80px]">Acciones</th>

                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {currencyItems.map((item) => (
                                <tr key={item.currency.id} className='select-none'>
                                    <td className="px-4 py-2 text-sm sm:text-base text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis">{item.currency.name}</td>
                                    <td className="px-4 py-2 text-sm sm:text-base text-gray-700 whitespace-nowrap">{item.quantity}</td>
                                    <td className="px-4 py-2 text-sm sm:text-base text-gray-700 whitespace-nowrap">{item.currency.exchange.toFixed(2)}</td>
                                    <td className="px-4 py-2 text-center whitespace-nowrap">
                                        <Button
                                            onClick={() => handleRemoveItem(item.currency.id)}
                                            type="button"
                                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 text-xs rounded-md shadow-sm transition-all duration-200 ease-in-out"
                                        >
                                            Quitar
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            <div className="flex flex-col sm:flex-row gap-3 items-end">
                <div className='flex-1 w-full sm:w-auto'>
                    <label htmlFor="current-currency" className="block text-sm font-medium text-gray-700 mb-1">RESTANTE EN:</label>
                    {currencies && (<select
                        id="current-currency"
                        value={valueCurrency}
                        onChange={e => {setValueCurrency(parseFloat(e.target.value))}}
                        className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base transition-all duration-200 ease-in-out"
                    >
                        {currencies.map((currency) => (
                            <option key={currency.id} value={currency.exchange}>
                                {currency.name}
                            </option>
                        ))}
                    </select>)}
                </div>
                
                <div className="text-center text-lg sm:text-xl font-bold text-gray-900 w-full flex-1 sm:w-auto">
                    Restante: {((total-(currencyItems.reduce((sum, item) => sum + (item.quantity/item.currency.exchange), 0)))*valueCurrency).toFixed(2).replace("-","")}
                </div>
                <Button
                    type="button"
                    className="w-full sm:w-auto bg-[#FB3D01] hover:bg-[#E03A00] text-white px-4 py-2 rounded-md shadow-lg transition-all duration-200 ease-in-out"
                    onClick={handleAddRemaining}
                >
                    AGREGAR RESTANTE
                </Button>
            </div>

            {/* Botones de acción */}
            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 mt-6">
                <Button
                    type="button"
                    onClick={onCancel}
                    className="w-full sm:w-auto bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md shadow-sm transition-all duration-200 ease-in-out"
                >
                    Cancelar
                </Button>
                <Button
                    type="submit"
                    className="w-full sm:w-auto bg-[#FB3D01] hover:bg-[#E03A00] text-white px-4 py-2 rounded-md shadow-lg transition-all duration-200 ease-in-out"
                >
                    FACTURAR
                </Button>
            </div>
        </form>
    );
};

export default BillingForm;
