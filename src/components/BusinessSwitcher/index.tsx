import { BUSINESS_META } from "@/constants/businesses";
import { usePressScale } from "@/hooks/usePressScale";
import type { BusinessId, BusinessRecord } from "@/types/business";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import clsx from "clsx";
import { useMemo, useState } from "react";
import { Animated, Modal, Pressable, Text, View } from "react-native";

type BusinessSwitcherProps = {
  businesses: BusinessRecord[];
  onChange: (businessId: BusinessId) => void;
  value: BusinessId;
};

type BusinessOptionProps = {
  business: BusinessRecord;
  isSelected: boolean;
  onPress: () => void;
};

function BusinessOption({
  business,
  isSelected,
  onPress,
}: BusinessOptionProps) {
  const { animatedStyle, onPressIn, onPressOut } = usePressScale({
    pressedScale: 0.97,
  });
  const iconName = BUSINESS_META[business.id].icon;

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        className={clsx(
          "flex-row items-center gap-4 rounded-lg px-4 py-4",
          isSelected ? "bg-primary" : "bg-background",
        )}
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={({ pressed }) => ({
          opacity: pressed ? 0.84 : 1,
        })}
      >
        <View
          className={clsx(
            "h-10 w-10 items-center justify-center rounded-xl",
            isSelected ? "bg-white/15" : "bg-white",
          )}
        >
          <MaterialCommunityIcons
            color={isSelected ? "#F6F3EE" : "#1A1C19"}
            name={iconName}
            size={20}
          />
        </View>

        <View className="flex-1">
          <Text
            className={clsx(
              "font-inter-semibold text-sm",
              isSelected ? "text-neutral" : "text-text",
            )}
          >
            {business.name}
          </Text>

          <Text
            className={clsx(
              "mt-1 font-inter-regular text-xs leading-5",
              isSelected ? "text-neutral/80" : "text-text/60",
            )}
          >
            {business.subtitle}
          </Text>
        </View>

        {isSelected ? (
          <MaterialCommunityIcons color="#F6F3EE" name="check" size={20} />
        ) : null}
      </Pressable>
    </Animated.View>
  );
}

export function BusinessSwitcher({
  businesses,
  onChange,
  value,
}: BusinessSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedBusiness = useMemo(
    () => businesses.find((business) => business.id === value) ?? businesses[0],
    [businesses, value],
  );

  return (
    <View className="items-start">
      <CompactTrigger
        business={selectedBusiness}
        onPress={() => setIsOpen(true)}
      />

      <Modal
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
        transparent
        visible={isOpen}
      >
        <View className="flex-1 items-center justify-center bg-black/20 px-6">
          <Pressable
            className="absolute inset-0"
            onPress={() => setIsOpen(false)}
          />

          <View className="w-full max-w-[380px] rounded-[24px] bg-white px-5 pb-5 pt-5">
            <Text className="font-inter-semibold text-lg text-text">
              Selecionar loja
            </Text>
            <Text className="mt-2 font-inter-regular text-sm leading-6 text-text/65">
              O painel, histórico, receitas e despesas vão usar essa seleção.
            </Text>

            <View className="mt-6 gap-3">
              {businesses.map((business) => (
                <BusinessOption
                  business={business}
                  isSelected={business.id === value}
                  key={business.id}
                  onPress={() => {
                    onChange(business.id);
                    setIsOpen(false);
                  }}
                />
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

type CompactTriggerProps = {
  business?: BusinessRecord;
  onPress: () => void;
};

function CompactTrigger({ business, onPress }: CompactTriggerProps) {
  const { animatedStyle, onPressIn, onPressOut } = usePressScale({
    pressedScale: 0.97,
  });

  if (!business) {
    return null;
  }

  const iconName = BUSINESS_META[business.id].icon;

  return (
    <Animated.View className="mt-3" style={animatedStyle}>
      <Pressable
        className="flex-row items-center gap-3 rounded-full bg-white px-4 py-3"
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={({ pressed }) => ({
          opacity: pressed ? 0.84 : 1,
        })}
      >
        <View className="h-9 w-9 items-center justify-center rounded-full bg-background">
          <MaterialCommunityIcons color="#1A1C19" name={iconName} size={18} />
        </View>

        <Text className="font-inter-medium text-sm text-text">
          {business.name}
        </Text>

        <MaterialCommunityIcons
          color="#68736D"
          name="chevron-down"
          size={20}
        />
      </Pressable>
    </Animated.View>
  );
}
