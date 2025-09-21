import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    Image,
} from '@react-pdf/renderer';
import { pdf } from '@react-pdf/renderer';

// Tipos para los datos de clientes
type CustomerReport = {
    customer: {
        ci: string;
        name: string;
        lastname: string;
        phone_number: string;
        address: string;
    };
    total_orders: number;
};

interface CustomersPDFProps {
    from: string;
    to: string;
    clients: CustomerReport[];
}

// Estilos PDF
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
    logoContainer: {
        position: 'absolute',
        top: 20,
        left: 20,
        zIndex: 1,
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
        color: '#FB3D01',
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
        marginBottom: 8,
    },
    label: {
        fontWeight: 'bold',
        width: '40%',
        textAlign: 'left',
        color: '#FB3D01',
    },
    value: {
        width: '60%',
        textAlign: 'right',
    },
    separator: {
        borderBottomWidth: 1,
        borderBottomColor: '#000',
        marginVertical: 15,
    },
    clientBlock: {
        marginBottom: 12,
        paddingBottom: 8,
        borderBottomWidth: 0.5,
        borderBottomColor: '#ccc',
    },
    clientName: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#FB3D01',
        marginBottom: 2,
    },
    clientInfo: {
        fontSize: 11,
        color: '#444',
        marginBottom: 1,
    },
    clientOrders: {
        fontSize: 12,
        color: '#222',
        marginTop: 2,
        fontWeight: 'bold',
    },
});

const CustomersPDFDocument = ({ from, to, clients }: CustomersPDFProps) => (
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
                <Text style={pdfStyles.subtitle}>Reporte de Clientes Más Frecuentes</Text>
            </View>
            <View style={pdfStyles.section}>
                <Text style={pdfStyles.sectionTitle}>Rango de Fechas</Text>
                <View style={pdfStyles.row}>
                    <Text style={pdfStyles.label}>Desde:</Text>
                    <Text style={pdfStyles.value}>{from}</Text>
                </View>
                <View style={pdfStyles.row}>
                    <Text style={pdfStyles.label}>Hasta:</Text>
                    <Text style={pdfStyles.value}>{to}</Text>
                </View>
            </View>
            <View style={pdfStyles.separator} />
            <View style={pdfStyles.section}>
                <Text style={pdfStyles.sectionTitle}>Clientes</Text>
                {clients.length === 0 ? (
                    <Text>No hay datos de clientes para este rango.</Text>
                ) : (
                    clients.map((item, idx) => (
                        <View key={item.customer.ci} style={pdfStyles.clientBlock}>
                            <Text style={pdfStyles.clientName}>{item.customer.name} {item.customer.lastname}</Text>
                            <Text style={pdfStyles.clientInfo}>C.I.: {item.customer.ci}</Text>
                            <Text style={pdfStyles.clientInfo}>Teléfono: {item.customer.phone_number}</Text>
                            <Text style={pdfStyles.clientInfo}>Dirección: {item.customer.address}</Text>
                            <Text style={pdfStyles.clientOrders}>Total de compras: {item.total_orders}</Text>
                        </View>
                    ))
                )}
            </View>
        </Page>
    </Document>
);

// Función para generar y descargar el PDF
export const generateCustomersPDF = async (props: CustomersPDFProps) => {
    try {
        const blob = await pdf(<CustomersPDFDocument {...props} />).toBlob();
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `reporte-clientes-${props.from}_a_${props.to}.pdf`;
        document.body.appendChild(link);
        link.click();

        setTimeout(() => {
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }, 100);
    } catch (error) {
        console.error('Error generando reporte de clientes:', error);
        throw new Error('No se pudo generar el reporte');
    }
};

export default CustomersPDFDocument;