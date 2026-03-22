import Abstract from "@/assets/abstract.svg";
import { MetricCard } from "@/components/MetricCard";
import { TransactionCard } from "@/components/TransactionCard";
import { ScrollView, Text, View } from "react-native";

export default function Index() {
  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="px-6 pb-12 pt-10"
      showsVerticalScrollIndicator={false}
    >
      <View className="items-end">
        <Text className="text-primary font-inter-semibold text-lg">
          Venda Fácil
        </Text>
      </View>

      <View className="mt-8 overflow-hidden rounded-lg bg-primary px-6 pb-6 pt-7">
        <Abstract
          width={150}
          height={150}
          style={{
            opacity: 0.2,
            position: "absolute",
            right: 24,
            top: -18,
          }}
        />

        <Text className="font-inter-regular text-base uppercase text-neutral/80">
          Lucro Disponível
        </Text>

        <Text className="mt-5 font-inter-bold text-3xl leading-none text-neutral">
          R$ 142.850,42
        </Text>
      </View>

      <View className="mt-7 gap-4">
        <MetricCard
          amount="R$ 84,200.00"
          change="12% a mais comparado ao mês anterior"
          title="Receita mensal"
          variant="income"
        />

        <MetricCard
          amount="R$ 52,140.20"
          change="12% a mais comparado ao mês anterior"
          title="Despesas mensais"
          variant="expense"
        />
      </View>

      <View className="mt-6">
        <Text className="text-text text-base font-inter-medium">
          Transações recentes
        </Text>
      </View>

      <View className="mt-4 gap-4">
        <TransactionCard
          amount="-R$ 1.240,50"
          category="bills"
          description="Fornecedor: Farm-to-Table Hub • há 2 horas"
          title="Suprimentos de Laticinios e Farinha Artesanal"
          typeLabel="Estoque"
          variant="expense"
        />

        <TransactionCard
          amount="+R$ 8.421,15"
          category="food"
          description="Terminal de Cartao #4 • há 5 horas"
          title="Pagamento do Jantar"
          typeLabel="Receita"
          variant="income"
        />

        <TransactionCard
          amount="-R$ 642,00"
          category="utilities"
          description="Metropolitan Energy • Ontem"
          title="Conta de Luz - Gas Natural"
          typeLabel="Custo fixo"
          variant="expense"
        />
      </View>
    </ScrollView>
  );
}
