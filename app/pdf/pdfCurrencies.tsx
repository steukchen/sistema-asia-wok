import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    Image,
} from '@react-pdf/renderer';
import { pdf } from '@react-pdf/renderer';

// Tipos para los datos de currencies
type CurrencyReport = {
    currency: {
        id: number;
        name: string;
        exchange: number;
    };
    quantity: number;
};

interface CurrenciesPDFProps {
    from: string;
    to: string;
    currencies: CurrencyReport[];
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
        width: '50%',
        textAlign: 'left',
        color: '#FB3D01',
    },
    value: {
        width: '50%',
        textAlign: 'right',
    },
    separator: {
        borderBottomWidth: 1,
        borderBottomColor: '#000',
        marginVertical: 15,
    },
});

const CurrenciesPDFDocument = ({ from, to, currencies }: CurrenciesPDFProps) => (
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
                <Text style={pdfStyles.subtitle}>Reporte de Divisas Recibidas</Text>
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
                <Text style={pdfStyles.sectionTitle}>Totales por Divisa</Text>
                {currencies.length === 0 ? (
                    <Text>No hay datos de divisas para este rango.</Text>
                ) : (
                    currencies.map((item) => (
                        <View key={item.currency.id} style={pdfStyles.row}>
                            <Text style={pdfStyles.label}>{item.currency.name}</Text>
                            <Text style={pdfStyles.value}>{item.quantity}</Text>
                        </View>
                    ))
                )}
            </View>
        </Page>
    </Document>
);

// Función para generar y descargar el PDF
export const generateCurrenciesPDF = async (props: CurrenciesPDFProps) => {
    try {
        const blob = await pdf(<CurrenciesPDFDocument {...props} />).toBlob();
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `reporte-divisas-${props.from}_a_${props.to}.pdf`;
        document.body.appendChild(link);
        link.click();

        setTimeout(() => {
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }, 100);
    } catch (error) {
        console.error('Error generando reporte de divisas:', error);
        throw new Error('No se pudo generar el reporte');
    }
};

export default CurrenciesPDFDocument;