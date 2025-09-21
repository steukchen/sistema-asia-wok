import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    Image,
} from '@react-pdf/renderer';
import { pdf } from '@react-pdf/renderer';

// Tipos para los datos de platos
type DishReport = {
    dish: {
        id: number;
        name: string;
        description: string;
        price: number;
        type: {
            id: number;
            name: string;
        };
    };
    quantity: number;
};

interface DishesPDFProps {
    from: string;
    to: string;
    dishes: DishReport[];
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
    dishBlock: {
        marginBottom: 12,
        paddingBottom: 8,
        borderBottomWidth: 0.5,
        borderBottomColor: '#ccc',
    },
    dishName: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#FB3D01',
        marginBottom: 2,
    },
    dishType: {
        fontSize: 11,
        color: '#333',
        marginBottom: 2,
    },
    dishInfo: {
        fontSize: 11,
        color: '#444',
    },
});

const DishesPDFDocument = ({ from, to, dishes }: DishesPDFProps) => (
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
                <Text style={pdfStyles.subtitle}>Reporte de Platos Más Vendidos</Text>
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
                <Text style={pdfStyles.sectionTitle}>Platos Vendidos</Text>
                <Text style={{ fontSize: 10, color: "#888", marginBottom: 8 }}>
                    Los precios mostrados son los actuales. Al momento de la venta, los precios pudieron haber sido diferentes.
                </Text>
                {dishes.length === 0 ? (
                    <Text>No hay datos de platos para este rango.</Text>
                ) : (
                    dishes.map((item) => (
                        <View key={item.dish.id} style={pdfStyles.dishBlock}>
                            <Text style={pdfStyles.dishName}>{item.dish.name}</Text>
                            <Text style={pdfStyles.dishType}>Tipo: {item.dish.type.name}</Text>
                            <Text style={pdfStyles.dishInfo}>Precio: ${item.dish.price}</Text>
                            <Text style={pdfStyles.dishInfo}>Cantidad vendida: {item.quantity}</Text>
                        </View>
                    ))
                )}
            </View>
        </Page>
    </Document>
);

// Función para generar y descargar el PDF
export const generateDishesPDF = async (props: DishesPDFProps) => {
    try {
        const blob = await pdf(<DishesPDFDocument {...props} />).toBlob();
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `reporte-platos-${props.from}_a_${props.to}.pdf`;
        document.body.appendChild(link);
        link.click();

        setTimeout(() => {
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }, 100);
    } catch (error) {
        console.error('Error generando reporte de platos:', error);
        throw new Error('No se pudo generar el reporte');
    }
};

export default DishesPDFDocument;