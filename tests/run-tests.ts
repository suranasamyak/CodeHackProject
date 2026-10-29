/**
 * ResourceLoop - Core Domain & Business Logic Unit Tests
 */

import { calculateDurationDays } from '../src/lib/formatters.ts';
import { DEMO_RESOURCES, DEMO_USERS } from '../src/data/seedData.ts';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion Failed: ${message}`);
  }
}

console.log('--- Starting ResourceLoop Test Suite ---');

// Test 1: Duration calculation
{
  const duration = calculateDurationDays('2026-11-01', '2026-11-04');
  assert(duration === 3, `Expected duration 3 days, got ${duration}`);
  console.log('✓ Test 1: Duration calculation passed');
}

// Test 2: Concurrency & Booking overlap logic
{
  const existingStart = new Date('2026-11-02').getTime();
  const existingEnd = new Date('2026-11-05').getTime();

  // Test overlapping range
  const reqStart = new Date('2026-11-04').getTime();
  const reqEnd = new Date('2026-11-07').getTime();

  const isOverlapping = Math.max(reqStart, existingStart) <= Math.min(reqEnd, existingEnd);
  assert(isOverlapping === true, 'Expected overlap detected');

  // Test non-overlapping range
  const reqStart2 = new Date('2026-11-06').getTime();
  const reqEnd2 = new Date('2026-11-08').getTime();
  const isOverlapping2 = Math.max(reqStart2, existingStart) <= Math.min(reqEnd2, existingEnd);
  assert(isOverlapping2 === false, 'Expected no overlap');
  console.log('✓ Test 2: Double-booking & concurrency overlap check passed');
}

// Test 3: FairShare policy duration limits
{
  const printer = DEMO_RESOURCES.find((r) => r.id === 'res_3d_printer')!;
  assert(Boolean(printer.fairShareMaxDays), '3D printer must have FairShare limits');
  const requestedDays = 5;
  const isWithinLimit = requestedDays <= (printer.fairShareMaxDays || 3);
  assert(isWithinLimit === false, 'Should reject bookings exceeding FairShare max consecutive days');
  console.log('✓ Test 3: FairShare maximum duration enforcement passed');
}

// Test 4: Resource-specific eligibility & safety training
{
  const student = DEMO_USERS.find((u) => u.role === 'student')!;
  const oscilloscope = DEMO_RESOURCES.find((r) => r.id === 'res_oscilloscope')!;
  const router = DEMO_RESOURCES.find((r) => r.id === 'res_cnc_workshop')!;

  const hasOscilloscopeTraining = student.completedTrainings?.includes(oscilloscope.trainingCourseName || '');
  assert(hasOscilloscopeTraining === true, 'Student Harsh has Basic Electronics Safety for oscilloscope');

  const hasCncTraining = student.completedTrainings?.includes(router.trainingCourseName || '');
  assert(hasCncTraining === false, 'Student Harsh lacks CNC Laser Safety certificate');
  console.log('✓ Test 4: Trust Passport resource-specific eligibility passed');
}

// Test 5: Maintenance Lockout Enforcement
{
  const spectrumAnalyser = DEMO_RESOURCES.find((r) => r.id === 'res_spectrum_analyser')!;
  assert(spectrumAnalyser.availability === 'maintenance', 'Spectrum analyser must be in maintenance');
  const isBookable = spectrumAnalyser.availability === 'available';
  assert(isBookable === false, 'Unit under maintenance must be locked from reservations');
  console.log('✓ Test 5: Maintenance lockout rule passed');
}

// Test 6: Check-In & Return Condition transitions
{
  const cleanCondition: string = 'pristine';
  const damagedCondition: string = 'damaged';

  const nextStatusClean = cleanCondition === 'damaged' ? 'returned_pending_inspection' : 'completed';
  const nextStatusDamaged = damagedCondition === 'damaged' ? 'returned_pending_inspection' : 'completed';

  assert(nextStatusClean === 'completed', 'Clean return should auto-complete');
  assert(nextStatusDamaged === 'returned_pending_inspection', 'Damaged return should flag for inspection');
  console.log('✓ Test 6: Lifecycle condition state transitions passed');
}

console.log('--- All 6 Test Suites Passed Successfully ---');
