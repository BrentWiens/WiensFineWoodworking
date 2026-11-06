import { notFound } from 'next/navigation';
import TripForm from '@/components/business/TripForm';
import ConfirmButton from '@/components/business/ConfirmButton';
import { getTrip, listPlaces, recentDestinations } from '@/lib/mileage/data';
import { oneWayKmFor } from '@/lib/mileage/validation';
import { deleteTripAction, updateTripAction } from '../actions';

export default async function EditTripPage({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) notFound();

  const [trip, places, recent] = await Promise.all([getTrip(id), listPlaces(), recentDestinations()]);
  if (!trip) notFound();

  const backHref = `/tools/business/mileage?year=${trip.tripDate.slice(0, 4)}`;

  return (
    <div className="space-y-6">
      <section className="bg-white border border-stone-200 rounded-lg p-4 sm:p-5">
        <h2 className="text-lg font-semibold text-stone-800 mb-3">Edit trip</h2>
        <TripForm
          mode="edit"
          action={updateTripAction.bind(null, trip.id)}
          places={places}
          suggestions={recent.map(r => r.destination)}
          cancelHref={backHref}
          initial={{
            tripDate: trip.tripDate,
            origin: trip.origin,
            destination: trip.destination,
            purpose: trip.purpose,
            oneWayKm: String(oneWayKmFor(trip)),
            roundTrip: trip.roundTrip,
            notes: trip.notes ?? '',
          }}
        />
      </section>

      <div className="flex items-center justify-between text-sm text-stone-500">
        <span>
          Logged {trip.createdAt.toLocaleDateString('en-CA', { timeZone: 'America/Toronto' })}
          {trip.updatedAt.getTime() - trip.createdAt.getTime() > 1000 &&
            `, edited ${trip.updatedAt.toLocaleDateString('en-CA', { timeZone: 'America/Toronto' })}`}
        </span>
        <ConfirmButton
          action={deleteTripAction.bind(null, trip.id)}
          confirmMessage={`Delete the trip to ${trip.destination} on ${trip.tripDate}?`}
          className="text-red-700 hover:text-red-900 underline underline-offset-2 disabled:opacity-50"
        >
          Delete trip
        </ConfirmButton>
      </div>
    </div>
  );
}
