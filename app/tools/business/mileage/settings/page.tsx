import ConfirmButton from '@/components/business/ConfirmButton';
import { PlaceForm, VehicleForm } from '@/components/business/SettingsForms';
import { getVehicle, listPlaces } from '@/lib/mileage/data';
import { createPlaceAction, deletePlaceAction, saveVehicleAction } from '../actions';

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
          <ul className="divide-y divide-stone-100 border border-stone-200 rounded-lg mb-5">
            {places.map(place => (
              <li key={place.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                <span className="text-stone-800">
                  {place.name}
                  {place.oneWayKm !== null && <span className="text-stone-500"> · {place.oneWayKm} km one way</span>}
                </span>
                <ConfirmButton
                  action={deletePlaceAction.bind(null, place.id)}
                  confirmMessage={`Remove ${place.name} from saved places? Logged trips are not affected.`}
                  className="text-sm text-red-700 hover:text-red-900 underline underline-offset-2 disabled:opacity-50"
                >
                  Remove
                </ConfirmButton>
              </li>
            ))}
          </ul>
        )}

        <PlaceForm action={createPlaceAction} />
      </section>
    </div>
  );
}
