import { PlaceForm, PlaceList, VehicleForm } from '@/components/business/SettingsForms';
import { getVehicle, listPlaces } from '@/lib/mileage/data';
import { createPlaceAction, deletePlaceAction, saveVehicleAction, updatePlaceAction } from '../actions';

export default async function MileageSettingsPage() {
  const [vehicle, places] = await Promise.all([getVehicle(), listPlaces()]);

  return (
    <div className="space-y-6">
      <section className="bg-white border border-stone-200 rounded-lg p-4 sm:p-5">
        <h2 className="text-lg font-semibold text-stone-800 mb-3">Vehicle</h2>
        <VehicleForm key={vehicle?.name ?? ''} action={saveVehicleAction} name={vehicle?.name ?? ''} />
      </section>

      <section className="bg-white border border-stone-200 rounded-lg p-4 sm:p-5">
        <h2 className="text-lg font-semibold text-stone-800 mb-1">Saved places</h2>
        <p className="text-sm text-stone-500 mb-4">
          Places you drive to often. Picking one fills in the destination and distance from the shop.
        </p>

        {places.length > 0 && (
          <PlaceList
            places={places.map(({ id, name, oneWayKm }) => ({ id, name, oneWayKm }))}
            updateAction={updatePlaceAction}
            deleteAction={deletePlaceAction}
          />
        )}

        <PlaceForm action={createPlaceAction} />
      </section>
    </div>
  );
}
