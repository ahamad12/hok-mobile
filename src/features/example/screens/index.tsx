import {
  AlertCircle,
  Bell,
  CheckCircle,
  ChevronRight,
  Clock,
  DollarSign,
  FileText,
  Filter,
  Fuel,
  Heart,
  Info,
  MapPin,
  Moon,
  Search,
  Settings2,
  ShoppingCart,
  Star,
  Sun,
  TrendingUp,
  Users,
  X,
  Zap,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { COLOR_THEME } from '@/constants';
import { useColors } from '@/contexts';
import {
  useSelectedTheme,
  useSetColorTheme,
} from '@/store/selectors/appSelectors';

// Mock data
const vehicles = [
  {
    id: 1,
    name: 'Tesla Model 3',
    type: 'Electric',
    price: 89,
    rating: 4.8,
    seats: 5,
    transmission: 'Auto',
    fuel: 'Electric',
    available: true,
    featured: true,
  },
  {
    id: 2,
    name: 'BMW X5',
    type: 'SUV',
    price: 120,
    rating: 4.9,
    seats: 7,
    transmission: 'Auto',
    fuel: 'Diesel',
    available: true,
    featured: true,
  },
  {
    id: 3,
    name: 'Toyota Camry',
    type: 'Sedan',
    price: 65,
    rating: 4.6,
    seats: 5,
    transmission: 'Auto',
    fuel: 'Petrol',
    available: true,
    featured: false,
  },
  {
    id: 4,
    name: 'Honda Civic',
    type: 'Sedan',
    price: 55,
    rating: 4.7,
    seats: 5,
    transmission: 'Manual',
    fuel: 'Petrol',
    available: false,
    featured: false,
  },
  {
    id: 5,
    name: 'Mercedes GLE',
    type: 'SUV',
    price: 150,
    rating: 4.9,
    seats: 5,
    transmission: 'Auto',
    fuel: 'Diesel',
    available: true,
    featured: true,
  },
  {
    id: 6,
    name: 'Audi A4',
    type: 'Sedan',
    price: 95,
    rating: 4.8,
    seats: 5,
    transmission: 'Auto',
    fuel: 'Petrol',
    available: true,
    featured: false,
  },
];

const categories = ['All', 'Electric', 'SUV', 'Sedan', 'Luxury'];

const priceRanges = [
  { label: 'Budget', min: 0, max: 60, icon: 'dollar' },
  { label: 'Standard', min: 61, max: 100, icon: 'dollar' },
  { label: 'Premium', min: 101, max: 200, icon: 'dollar' },
];

const notifications = [
  {
    id: 1,
    type: 'success',
    message: 'Your booking for Tesla Model 3 is confirmed!',
  },
  { id: 2, type: 'info', message: 'New electric vehicles available this week' },
  { id: 3, type: 'warning', message: 'Honda Civic will be available tomorrow' },
];

const VehicleRentalApp = () => {
  const selectedTheme = useSelectedTheme();
  const setColorTheme = useSetColorTheme();
  const insets = useSafeAreaInsets();
  const { colors } = useColors();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedVehicle, setSelectedVehicle] = useState<number | null>(null);
  const [showNotifications, setShowNotifications] = useState(true);
  const [selectedPriceRange, setSelectedPriceRange] = useState<string | null>(
    null,
  );
  const [favoriteVehicles, setFavoriteVehicles] = useState<number[]>([1, 2]);

  const toggleTheme = () => {
    setColorTheme(
      selectedTheme === COLOR_THEME.DARK ? COLOR_THEME.LIGHT : COLOR_THEME.DARK,
    );
  };

  const toggleFavorite = (vehicleId: number) => {
    if (favoriteVehicles.includes(vehicleId)) {
      setFavoriteVehicles(favoriteVehicles.filter((id) => id !== vehicleId));
    } else {
      setFavoriteVehicles([...favoriteVehicles, vehicleId]);
    }
  };

  const filteredVehicles = vehicles.filter((vehicle) => {
    const matchesSearch = vehicle.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All' || vehicle.type === selectedCategory;
    const matchesPriceRange =
      !selectedPriceRange ||
      (() => {
        const range = priceRanges.find((r) => r.label === selectedPriceRange);
        return range
          ? vehicle.price >= range.min && vehicle.price <= range.max
          : true;
      })();
    return matchesSearch && matchesCategory && matchesPriceRange;
  });

  return (
    <View
      // eslint-disable-next-line react-native/no-inline-styles
      style={{
        flex: 1,
        paddingTop: insets.top,
        backgroundColor: colors.background.default,
      }}>
      {/* Header */}
      <View
        style={[styles.header, { borderBottomColor: colors.border.subtle }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={[styles.greeting, { color: colors.text.secondary }]}>
              Good Morning
            </Text>
            <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
              Find Your Vehicle
            </Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={() => setShowNotifications(!showNotifications)}
              style={[
                styles.iconButton,
                {
                  backgroundColor: colors.background.default,
                  borderColor: colors.border.default,
                },
              ]}>
              <Bell size={20} color={colors.icon.primary} />
              <View
                style={[
                  styles.notificationBadge,
                  {
                    backgroundColor: colors.background.error,
                  },
                ]}>
                <Text
                  style={[
                    styles.notificationBadgeText,
                    { color: colors.text.white },
                  ]}>
                  {notifications.length}
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={toggleTheme}
              style={[
                styles.iconButton,
                {
                  backgroundColor: colors.background.default,
                  borderColor: colors.border.default,
                },
              ]}>
              {selectedTheme === COLOR_THEME.DARK ? (
                <Sun size={20} color={colors.icon.primary} />
              ) : (
                <Moon size={20} color={colors.icon.primary} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Notifications */}
        {showNotifications && notifications.length > 0 && (
          <View style={styles.notificationsContainer}>
            {notifications.map((notification) => (
              <View
                key={notification.id}
                style={[
                  styles.notificationCard,
                  {
                    backgroundColor:
                      notification.type === 'success'
                        ? colors.background.successSubtle
                        : notification.type === 'warning'
                          ? colors.background.warningSubtle
                          : colors.background.infoSubtle,
                    borderColor:
                      notification.type === 'success'
                        ? colors.border.success
                        : notification.type === 'warning'
                          ? colors.border.warning
                          : colors.border.info,
                  },
                ]}>
                {notification.type === 'success' && (
                  <CheckCircle size={18} color={colors.icon.success} />
                )}
                {notification.type === 'warning' && (
                  <AlertCircle size={18} color={colors.icon.warning} />
                )}
                {notification.type === 'info' && (
                  <Info size={18} color={colors.icon.info} />
                )}
                <Text
                  style={[
                    styles.notificationText,
                    {
                      color:
                        notification.type === 'success'
                          ? colors.text.success
                          : notification.type === 'warning'
                            ? colors.text.warning
                            : colors.text.info,
                    },
                  ]}>
                  {notification.message}
                </Text>
                <TouchableOpacity>
                  <X size={16} color={colors.icon.tertiary} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Search Bar */}
        <View
          style={[
            styles.searchContainer,
            {
              backgroundColor: colors.background.default,
              borderColor: colors.border.default,
            },
          ]}>
          <Search size={20} color={colors.icon.secondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text.primary }]}
            placeholder='Search vehicles...'
            placeholderTextColor={colors.text.tertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={20} color={colors.icon.tertiary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              onPress={() => setSelectedCategory(category)}
              style={[
                styles.categoryChip,
                {
                  backgroundColor:
                    selectedCategory === category
                      ? colors.button.primary.default
                      : colors.background.default,
                  borderColor:
                    selectedCategory === category
                      ? colors.border.active
                      : colors.border.default,
                },
              ]}>
              <Text
                style={[
                  styles.categoryText,
                  {
                    color:
                      selectedCategory === category
                        ? colors.text.white
                        : colors.text.primary,
                  },
                ]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Price Ranges */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.priceRangesContainer}>
          {priceRanges.map((range) => (
            <TouchableOpacity
              key={range.label}
              onPress={() =>
                setSelectedPriceRange(
                  selectedPriceRange === range.label ? null : range.label,
                )
              }
              style={[
                styles.priceChip,
                {
                  backgroundColor:
                    selectedPriceRange === range.label
                      ? colors.button.secondary.default
                      : colors.background.default,
                  borderColor:
                    selectedPriceRange === range.label
                      ? colors.border.focus
                      : colors.border.subtle,
                },
              ]}>
              <DollarSign
                size={16}
                color={
                  selectedPriceRange === range.label
                    ? colors.icon.primary
                    : colors.icon.tertiary
                }
              />
              <Text
                style={[
                  styles.priceChipText,
                  {
                    color:
                      selectedPriceRange === range.label
                        ? colors.text.primary
                        : colors.text.secondary,
                  },
                ]}>
                {range.label}
              </Text>
              <Text
                style={[
                  styles.priceChipRange,
                  {
                    color: colors.text.tertiary,
                  },
                ]}>
                ${range.min}-${range.max}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Vehicle List */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}>
        <View style={styles.resultsHeader}>
          <View style={styles.resultsLeft}>
            <TrendingUp size={20} color={colors.icon.secondary} />
            <Text style={[styles.resultsText, { color: colors.text.primary }]}>
              {filteredVehicles.length} vehicles
            </Text>
          </View>
          <TouchableOpacity style={styles.filterButton}>
            <Filter size={18} color={colors.icon.primary} />
            <Text style={[styles.filterText, { color: colors.text.primary }]}>
              Filters
            </Text>
          </TouchableOpacity>
        </View>

        {filteredVehicles.map((vehicle) => (
          <TouchableOpacity
            key={vehicle.id}
            activeOpacity={0.7}
            onPress={() => setSelectedVehicle(vehicle.id)}
            style={[
              styles.vehicleCard,
              // eslint-disable-next-line react-native/no-inline-styles
              {
                backgroundColor: colors.background.default,
                borderColor:
                  selectedVehicle === vehicle.id
                    ? colors.border.active
                    : colors.border.subtle,
                borderWidth: selectedVehicle === vehicle.id ? 2 : 1,
                shadowColor:
                  selectedVehicle === vehicle.id
                    ? colors.brand.primary
                    : colors.text.primary,
                opacity: vehicle.available ? 1 : 0.6,
              },
            ]}>
            {/* Vehicle Image Placeholder */}
            <View
              style={[
                styles.vehicleImageContainer,
                {
                  backgroundColor: colors.background.disabled,
                  borderColor: colors.border.subtle,
                },
              ]}>
              <View
                style={[
                  styles.imagePlaceholder,
                  {
                    backgroundColor: colors.background.default,
                    borderColor: colors.border.default,
                  },
                ]}>
                <MapPin
                  size={48}
                  color={colors.icon.tertiary}
                  strokeWidth={1.5}
                />
              </View>

              {/* Type Badge */}
              <View
                style={[
                  styles.typeBadge,
                  {
                    backgroundColor: colors.background.default,
                    borderColor: colors.border.default,
                  },
                ]}>
                <Text
                  style={[
                    styles.typeBadgeText,
                    { color: colors.text.secondary },
                  ]}>
                  {vehicle.type}
                </Text>
              </View>

              {/* Availability Status */}
              {!vehicle.available && (
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor: colors.background.errorSubtle,
                      borderColor: colors.border.error,
                    },
                  ]}>
                  <Clock size={14} color={colors.icon.error} />
                  <Text
                    style={[styles.statusText, { color: colors.text.error }]}>
                    Unavailable
                  </Text>
                </View>
              )}

              {/* Featured Badge */}
              {vehicle.featured && vehicle.available && (
                <View
                  style={[
                    styles.featuredBadge,
                    {
                      backgroundColor: colors.button.primary.default,
                    },
                  ]}>
                  <Star
                    size={12}
                    color={colors.icon.inverse}
                    fill={colors.icon.inverse}
                  />
                  <Text
                    style={[styles.featuredText, { color: colors.text.white }]}>
                    Featured
                  </Text>
                </View>
              )}

              {/* Favorite Button */}
              <TouchableOpacity
                onPress={() => toggleFavorite(vehicle.id)}
                style={[
                  styles.favoriteButton,
                  {
                    backgroundColor: favoriteVehicles.includes(vehicle.id)
                      ? colors.background.error
                      : colors.background.default,
                    borderColor: colors.border.default,
                  },
                ]}>
                <Heart
                  size={18}
                  color={
                    favoriteVehicles.includes(vehicle.id)
                      ? colors.icon.inverse
                      : colors.icon.secondary
                  }
                  fill={
                    favoriteVehicles.includes(vehicle.id)
                      ? colors.icon.inverse
                      : 'transparent'
                  }
                />
              </TouchableOpacity>
            </View>

            {/* Vehicle Info */}
            <View style={styles.vehicleInfo}>
              <View style={styles.vehicleHeader}>
                <View // eslint-disable-next-line react-native/no-inline-styles
                  style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.vehicleName,
                      { color: colors.text.primary },
                    ]}>
                    {vehicle.name}
                  </Text>
                  <View style={styles.vehicleSubInfo}>
                    {vehicle.fuel === 'Electric' ? (
                      <Zap size={14} color={colors.icon.success} />
                    ) : (
                      <Fuel size={14} color={colors.icon.secondary} />
                    )}
                    <Text
                      style={[
                        styles.vehicleType,
                        { color: colors.text.secondary },
                      ]}>
                      {vehicle.fuel}
                    </Text>
                  </View>
                </View>
                <View
                  style={[
                    styles.ratingBadge,
                    {
                      backgroundColor: colors.background.successSubtle,
                      borderColor: colors.border.success,
                    },
                  ]}>
                  <Star
                    size={14}
                    color={colors.icon.success}
                    fill={colors.icon.success}
                  />
                  <Text
                    style={[styles.ratingText, { color: colors.text.success }]}>
                    {vehicle.rating}
                  </Text>
                </View>
              </View>

              {/* Vehicle Specs */}
              <View style={styles.vehicleSpecs}>
                <View style={styles.specItem}>
                  <Users size={18} color={colors.icon.secondary} />
                  <Text
                    style={[
                      styles.specValue,
                      { color: colors.text.secondary },
                    ]}>
                    {vehicle.seats} Seats
                  </Text>
                </View>
                <View
                  style={[
                    styles.specDivider,
                    { backgroundColor: colors.border.subtle },
                  ]}
                />
                <View style={styles.specItem}>
                  <Settings2 size={18} color={colors.icon.secondary} />
                  <Text
                    style={[
                      styles.specValue,
                      { color: colors.text.secondary },
                    ]}>
                    {vehicle.transmission}
                  </Text>
                </View>
              </View>

              {/* Price & Book Button */}
              <View style={styles.vehicleFooter}>
                <View>
                  <Text
                    style={[
                      styles.priceLabel,
                      { color: colors.text.tertiary },
                    ]}>
                    Per day
                  </Text>
                  <View style={styles.priceRow}>
                    <Text
                      style={[
                        styles.priceValue,
                        { color: colors.text.primary },
                      ]}>
                      ${vehicle.price}
                    </Text>
                    <Text
                      style={[
                        styles.priceDecimal,
                        { color: colors.text.secondary },
                      ]}>
                      .00
                    </Text>
                  </View>
                </View>
                {vehicle.available ? (
                  <TouchableOpacity
                    style={[
                      styles.bookButton,
                      {
                        backgroundColor: colors.button.primary.default,
                      },
                    ]}
                    activeOpacity={0.8}>
                    <Text
                      style={[
                        styles.bookButtonText,
                        { color: colors.text.white },
                      ]}>
                      Book Now
                    </Text>
                    <ChevronRight size={18} color={colors.icon.inverse} />
                  </TouchableOpacity>
                ) : (
                  <View
                    style={[
                      styles.bookButtonDisabled,
                      {
                        backgroundColor: colors.button.primary.disabled,
                        borderColor: colors.border.disabled,
                      },
                    ]}>
                    <Text
                      style={[
                        styles.bookButtonTextDisabled,
                        { color: colors.text.disabled },
                      ]}>
                      Not Available
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {filteredVehicles.length === 0 && (
          <View style={styles.emptyState}>
            <View
              style={[
                styles.emptyIcon,
                {
                  backgroundColor: colors.background.disabled,
                  borderColor: colors.border.subtle,
                },
              ]}>
              <Search
                size={48}
                color={colors.icon.tertiary}
                strokeWidth={1.5}
              />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text.primary }]}>
              No vehicles found
            </Text>
            <Text style={[styles.emptyText, { color: colors.text.secondary }]}>
              Try adjusting your search or filters
            </Text>
            <View style={styles.emptyActions}>
              <TouchableOpacity
                style={[
                  styles.resetButton,
                  {
                    backgroundColor: colors.button.secondary.default,
                    borderColor: colors.button.secondary.border,
                  },
                ]}
                onPress={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                  setSelectedPriceRange(null);
                }}>
                <Text
                  style={[
                    styles.resetButtonText,
                    { color: colors.text.primary },
                  ]}>
                  Reset Filters
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.tertiaryButton,
                  {
                    backgroundColor: colors.button.tertiary.default,
                  },
                ]}
                onPress={() => setSearchQuery('')}>
                <Text
                  style={[
                    styles.tertiaryButtonText,
                    { color: colors.text.link },
                  ]}>
                  Clear Search
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Stats Section */}
        {filteredVehicles.length > 0 && (
          <View style={styles.statsSection}>
            <Text
              style={[
                styles.statsSectionTitle,
                { color: colors.text.primary },
              ]}>
              Quick Stats
            </Text>
            <View style={styles.statsGrid}>
              <View
                style={[
                  styles.statCard,
                  {
                    backgroundColor: colors.background.default,
                    borderColor: colors.border.subtle,
                  },
                ]}>
                <View
                  style={[
                    styles.statIcon,
                    {
                      backgroundColor: colors.background.successSubtle,
                    },
                  ]}>
                  <CheckCircle size={24} color={colors.icon.success} />
                </View>
                <Text
                  style={[styles.statValue, { color: colors.text.primary }]}>
                  {vehicles.filter((v) => v.available).length}
                </Text>
                <Text
                  style={[styles.statLabel, { color: colors.text.secondary }]}>
                  Available
                </Text>
              </View>

              <View
                style={[
                  styles.statCard,
                  {
                    backgroundColor: colors.background.default,
                    borderColor: colors.border.subtle,
                  },
                ]}>
                <View
                  style={[
                    styles.statIcon,
                    {
                      backgroundColor: colors.background.infoSubtle,
                    },
                  ]}>
                  <Star size={24} color={colors.icon.info} />
                </View>
                <Text
                  style={[styles.statValue, { color: colors.text.primary }]}>
                  {vehicles.filter((v) => v.featured).length}
                </Text>
                <Text
                  style={[styles.statLabel, { color: colors.text.secondary }]}>
                  Featured
                </Text>
              </View>

              <View
                style={[
                  styles.statCard,
                  {
                    backgroundColor: colors.background.default,
                    borderColor: colors.border.subtle,
                  },
                ]}>
                <View
                  style={[
                    styles.statIcon,
                    {
                      backgroundColor: colors.background.errorSubtle,
                    },
                  ]}>
                  <Heart size={24} color={colors.icon.error} />
                </View>
                <Text
                  style={[styles.statValue, { color: colors.text.primary }]}>
                  {favoriteVehicles.length}
                </Text>
                <Text
                  style={[styles.statLabel, { color: colors.text.secondary }]}>
                  Favorites
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom Action Bar */}
      <View
        style={[
          styles.bottomBar,
          {
            backgroundColor: colors.background.default,
            borderTopColor: colors.border.subtle,
            paddingBottom: insets.bottom,
          },
        ]}>
        <TouchableOpacity
          style={[
            styles.bottomButton,
            {
              backgroundColor: colors.button.secondary.default,
              borderColor: colors.button.secondary.border,
            },
          ]}
          activeOpacity={0.8}>
          <FileText size={20} color={colors.icon.primary} />
          <Text
            style={[styles.bottomButtonText, { color: colors.text.primary }]}>
            Bookings
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.bottomButtonPrimary,
            {
              backgroundColor: colors.button.primary.default,
            },
          ]}
          activeOpacity={0.8}>
          <ShoppingCart size={20} color={colors.icon.inverse} />
          <Text
            style={[
              styles.bottomButtonPrimaryText,
              { color: colors.text.white },
            ]}>
            View Cart
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default VehicleRentalApp;

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 14,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  notificationsContainer: {
    marginTop: 12,
    gap: 8,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
  },
  notificationText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  categoriesContainer: {
    gap: 8,
    paddingRight: 20,
  },
  categoryChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  priceRangesContainer: {
    gap: 8,
    paddingRight: 20,
    marginTop: 12,
  },
  priceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  priceChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  priceChipRange: {
    fontSize: 11,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  resultsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  resultsText: {
    fontSize: 16,
    fontWeight: '600',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
  },
  vehicleCard: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  vehicleImageContainer: {
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    position: 'relative',
  },
  imagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  typeBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  featuredBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  featuredText: {
    fontSize: 11,
    fontWeight: '700',
  },
  favoriteButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vehicleInfo: {
    padding: 16,
  },
  vehicleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  vehicleName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  vehicleSubInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  vehicleType: {
    fontSize: 14,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
  },
  vehicleSpecs: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 16,
    gap: 16,
  },
  specItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  specValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  specDivider: {
    width: 1,
    height: 24,
  },
  vehicleFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceValue: {
    fontSize: 28,
    fontWeight: '700',
  },
  priceDecimal: {
    fontSize: 18,
    fontWeight: '600',
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  bookButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  bookButtonDisabled: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  bookButtonTextDisabled: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  resetButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  bottomBar: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    gap: 12,
  },
  bottomButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  bottomButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  bottomButtonPrimaryText: {
    fontSize: 16,
    fontWeight: '600',
  },
  bottomButtonPrimary: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
  },
  emptyActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  tertiaryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  tertiaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  statsSection: {
    marginTop: 32,
    paddingHorizontal: 20,
  },
  statsSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
});
