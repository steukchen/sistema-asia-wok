import {
    Document,
    Page,
    Text,
    Image,
    View,
    StyleSheet,
} from '@react-pdf/renderer';
import { pdf } from '@react-pdf/renderer';

interface Data {
    customer: Customer
    order: Order
    dishes: OrderItem[]
    currencies?: OrderCurrencyItem[]
}

// Mejorado: Estilos organizados y mejor legibilidad
const pdfStyles = StyleSheet.create({
    page: {
        padding: 40,
        fontFamily: 'Times-Roman',
        fontSize: 12,
        lineHeight: 1.5,
    },
    headerContainer: {
        marginBottom: 20,
        alignItems: 'center',
    },
    logo: {
        width: 80,
        height: 80,
        marginBottom: 10,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 14,
        marginBottom: 15,
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 10,
        textDecoration: 'underline',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    label: {
        fontWeight: 'bold',
        width: '30%',
        textAlign: 'right',
    },
    value: {
        width: '65%',
        textAlign: 'left',
    },
    separator: {
        borderBottomWidth: 1,
        borderBottomColor: '#000',
        marginVertical: 15,
    },
    photo: {
        width: 120,
        height: 150,
        marginTop: 10,
        borderWidth: 1,
        borderColor: '#ccc',
    },
    logoContainer: {
        position: 'absolute',
        top: 20,
        left: 20,
        zIndex: 1,
    },
});

const MyPdfDocument = ({ data }: { data: Data }) => {
    const buildImageUrl = (path: string) => {
        const baseUrl = '';
        return `${baseUrl}${path.replace(/\\/g, '/')}`;
    };

    const total = data.dishes.reduce(
        (acc, item) => acc + item.quantity * item.dish.price,
        0
    );

    return (
        <Document>
            <Page style={pdfStyles.page}>
                <View style={pdfStyles.logoContainer}>
                    <Image 
                        style={pdfStyles.logo} 
                        source={"/asia-wok-logo.jpg"} 
                    />
                </View>

                <View style={pdfStyles.headerContainer}>
                    <Text style={pdfStyles.title}>ASIA WOK</Text>
                    <Text style={pdfStyles.subtitle}>Comprobante de Pago</Text>
                </View>

                {/* DATOS DEL CLIENTE */}
                <View style={pdfStyles.section}>
                    <Text style={pdfStyles.sectionTitle}>DATOS DEL CLIENTE</Text>

                    <View style={pdfStyles.row}>
                        <Text style={pdfStyles.label}>Cédula:</Text>
                        <Text style={pdfStyles.value}>{data.customer.ci || 'N/D'}</Text>
                    </View>
                    <View style={pdfStyles.row}>
                        <Text style={pdfStyles.label}>Nombre:</Text>
                        <Text style={pdfStyles.value}>
                            {`${data.customer.name} ${data.customer.lastname}`.trim() || 'N/D'}
                        </Text>
                    </View>
                    <View style={pdfStyles.row}>
                        <Text style={pdfStyles.label}>Teléfono:</Text>
                        <Text style={pdfStyles.value}>{data.customer.phone_number || 'N/D'}</Text>
                    </View>
                    <View style={pdfStyles.row}>
                        <Text style={pdfStyles.label}>Dirección:</Text>
                        <Text style={pdfStyles.value}>{data.customer.address || 'N/D'}</Text>
                    </View>
                </View>

                <View style={pdfStyles.separator} />

                {/* INFORMACIÓN DEL PEDIDO */}
                <View style={pdfStyles.section}>
                    <Text style={pdfStyles.sectionTitle}>DETALLES DEL PEDIDO</Text>

                    <View style={pdfStyles.row}>
                        <Text style={pdfStyles.label}>N° Orden:</Text>
                        <Text style={pdfStyles.value}>{data.order.id}</Text>
                    </View>
                    <View style={pdfStyles.row}>
                        <Text style={pdfStyles.label}>Fecha:</Text>
                        <Text style={pdfStyles.value}>
                            {new Date(data.order.order_date).toLocaleDateString()}
                        </Text>
                    </View>
                </View>

                <View style={pdfStyles.separator} />


                <View style={pdfStyles.section}>
                    <Text style={pdfStyles.sectionTitle}>PRODUCTOS</Text>
                    {data.dishes.map((item) => (
                        <View key={item.dish.id} style={pdfStyles.row}>
                            <Text style={pdfStyles.value}>
                                {item.quantity} x {item.dish.name} @ {item.dish.price.toFixed(2)} $
                            </Text>
                            <Text style={pdfStyles.label}>
                                {(item.quantity * item.dish.price).toFixed(2)} $
                            </Text>
                        </View>
                    ))}


                    <View style={pdfStyles.row}>
                        <Text style={pdfStyles.value}>Total $:</Text>
                        <Text style={pdfStyles.label}>{total.toFixed(2)} $</Text>
                    </View>
                </View>

                <View style={pdfStyles.separator} />

                <View style={pdfStyles.section}>
                    <Text style={pdfStyles.sectionTitle}>DIVISAS PAGADAS</Text>

                    {data.currencies?.map(({ quantity, currency }) => (
                        <View key={currency.id} style={pdfStyles.row}>
                            <Text style={pdfStyles.label}>{currency.name}:</Text>
                            <Text style={pdfStyles.value}>
                                {quantity.toFixed(2)} {currency.name} @ {currency.exchange.toFixed(2)} 
                            </Text>
                        </View>
                    ))}
                </View>

            </Page>
        </Document>
    );
};

// Función de generación de PDF (se mantiene similar pero con mejor nombre)
export const generatePDF = async (data: Data) => {
    try {
        const blob = await pdf(<MyPdfDocument data={data} />).toBlob();
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `comprobante-pago-${data.order.id}-${data.customer.ci}.pdf`;
        document.body.appendChild(link);
        link.click();
        
        // Limpieza
        setTimeout(() => {
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }, 100);
    } catch (error) {
        console.error('Error generando comprobante:', error);
        throw new Error('No se pudo generar el comprobante');
    }
};