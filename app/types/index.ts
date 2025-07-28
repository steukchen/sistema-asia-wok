type UserRole = "admin" | "waiter" | "chef" | "cashier";

interface User {
    id: string;
    email: string;
    username: string;
    rol: UserRole;
}

interface UserFormData {
    id?: string;
    email: string;
    username: string;
    rol: UserRole;
    password?: string;
}

interface DataResponse {
    user_data: User;
    ws_token: string;
}

interface DishType {
    id: number;
    name: string;
}

interface Dish {
    id: number;
    name: string;
    description: string;
    price: number;
    type: DishType;
}

interface DishFormData {
    id?: number;
    name: string;
    description: string;
    price: number;
    type_id: number;
}

type OrderStatus = "pending" | "preparing" | "made" | "completed" | "cancelled";
interface OrderItemCreation {
    dish_id: number;
    quantity: number;
}

interface OrderItem {
    quantity: number;
    dish: Dish;
}

interface Order {
    id: number;
    created_by: string;
    customer_id?: number;
    table: Table;
    state: OrderStatus;
    notes?: string;
    order_date: string;
}

interface OrderCreationFormData {
    table_id: number;
    dishes: OrderItemCreation[];
    notes?: string;
}

interface OrderWithDishes {
    id: number;
    created_by: string;
    table: Table;
    state: OrderStatus;
    notes?: string;
    order_date: string;
    dishes: OrderItem[];
}

interface OrderUpdateFormData {
    table_id?: number;
    state?: OrderStatus;
    notes?: string;
    dishes?: OrderItemCreation[];
}

type TableState = "enabled" | "occupied" | "disabled" | "reserved";
interface Table {
    id: number;
    name: string;
    state: TableState;
}

interface Currency {
    id: number;
    name: string;
    exchange: number;
}

interface OrderCurrencyItem {
    quantity: number;
    currency: Currency;
}

interface OrderCurrencyCreation {
    currency_id: number;
    quantity: number;
}

interface OrderCurrenciesCreation {
    customer_id?: number;
    currencies: OrderCurrencyCreation[];
}

interface OrderWithCurrencies {
    id: number;
    created_by: string;
    table_id: number;
    state: OrderStatus;
    notes?: string;
    order_date: string;
    currencies: OrderCurrencyItem[];
}
