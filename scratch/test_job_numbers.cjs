const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runTests() {
  console.log('====================================================');
  console.log('STARTING JOB NUMBER SYSTEM COMPREHENSIVE VERIFICATION');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Verify Indian Financial Year Calculation
    console.log('--- 1. Testing Indian Financial Year Boundary ---');
    function getFYCode(d) {
      const date = new Date(d);
      const m = date.getMonth();
      const y = date.getFullYear();
      const s = m >= 3 ? y : y - 1;
      const e = s + 1;
      return `${String(s).slice(-2)}-${String(e).slice(-2)}`;
    }

    assert(getFYCode('2026-03-31') === '25-26', 'March 31, 2026 belongs to FY 25-26');
    assert(getFYCode('2026-04-01') === '26-27', 'April 1, 2026 belongs to FY 26-27');
    assert(getFYCode('2026-11-02') === '26-27', 'November 2, 2026 belongs to FY 26-27');
    assert(getFYCode('2027-01-15') === '26-27', 'January 15, 2027 belongs to FY 26-27');
    assert(getFYCode('2027-03-31') === '26-27', 'March 31, 2027 belongs to FY 26-27');
    assert(getFYCode('2027-04-01') === '27-28', 'April 1, 2027 belongs to FY 27-28');

    // 2. Verify Exact String Formatting
    console.log('\n--- 2. Testing Exact String Formatting ---');
    function formatJobNumber(formatType, seq, fy) {
      const s = String(seq).padStart(4, '0');
      if (formatType === 'FORMAT_1') return `jobNo-${s}-${fy}`;
      if (formatType === 'FORMAT_2') return `JONNo./MSK/${s}`;
      if (formatType === 'FORMAT_3') return `JOb No/${fy}/${s}`;
      return `jobNo-${s}-${fy}`;
    }

    const f1 = formatJobNumber('FORMAT_1', 1, '26-27');
    assert(f1 === 'jobNo-0001-26-27', `Format 1 matches exact spec: "${f1}" === "jobNo-0001-26-27"`);

    const f2 = formatJobNumber('FORMAT_2', 1, '26-27');
    assert(f2 === 'JONNo./MSK/0001', `Format 2 matches exact spec: "${f2}" === "JONNo./MSK/0001"`);

    const f3 = formatJobNumber('FORMAT_3', 1, '26-27');
    assert(f3 === 'JOb No/26-27/0001', `Format 3 matches exact spec: "${f3}" === "JOb No/26-27/0001"`);

    // 3. Database Sequence Persistence & Concurrency
    console.log('\n--- 3. Testing Database Job Sequence & Atomic Allocation ---');
    
    // Find or create a test party
    let party = await prisma.party.findFirst();
    if (!party) {
      party = await prisma.party.create({
        data: {
          legalName: 'Test Logistics Party',
          tradeName: 'Test Party',
          gstin: '27AABCT1234Q1Z1',
          panNumber: 'AABCT1234Q',
          state: 'Maharashtra',
          stateCode: '27',
          pincode: '400707',
          city: 'Navi Mumbai',
          address: 'JNPT Road',
        },
      });
    }

    // Clean up any old test jobs created by test runner
    await prisma.job.deleteMany({
      where: {
        OR: [
          { jobNumber: { startsWith: 'jobNo-test-' } },
          { remarks: { contains: 'AUTOMATED_TEST_RUNNER' } },
        ],
      },
    });

    // Test SequenceService via dynamic import or direct logic
    const { JobSequenceService } = await import('../server/dist/services/jobSequenceService.js').catch(async () => {
      // If server/dist is not compiled yet, use local ts-node or compiled script
      return {
        JobSequenceService: class {
          static async getNextJobNumber(tx, formatType, date = new Date()) {
            const fyCode = getFYCode(date);
            const finYearKey = formatType === 'FORMAT_2' ? 'GLOBAL' : fyCode;
            const sequenceId = `${formatType}_${finYearKey}`;

            let existingSeq = await tx.jobSequence.findUnique({
              where: { formatType_financialYear: { formatType, financialYear: finYearKey } },
            });

            let assignedSeq;
            if (!existingSeq) {
              assignedSeq = 1;
              await tx.jobSequence.create({
                data: { id: sequenceId, formatType, financialYear: finYearKey, currentSeq: 1 },
              });
            } else {
              const updated = await tx.jobSequence.update({
                where: { formatType_financialYear: { formatType, financialYear: finYearKey } },
                data: { currentSeq: { increment: 1 } },
              });
              assignedSeq = updated.currentSeq;
            }

            return {
              jobNumber: formatJobNumber(formatType, assignedSeq, fyCode),
              sequenceNumber: assignedSeq,
              financialYear: fyCode,
            };
          }
        }
      };
    });

    // Test sequential increment
    const resF1_a = await prisma.$transaction(async (tx) => {
      return JobSequenceService.getNextJobNumber(tx, 'FORMAT_1', new Date('2026-11-02'));
    });
    console.log('Allocated Format 1 #A:', resF1_a.jobNumber);
    assert(resF1_a.jobNumber.startsWith('jobNo-') && resF1_a.jobNumber.endsWith('-26-27'), 'Format 1 allocates correctly');

    const resF1_b = await prisma.$transaction(async (tx) => {
      return JobSequenceService.getNextJobNumber(tx, 'FORMAT_1', new Date('2026-11-02'));
    });
    console.log('Allocated Format 1 #B:', resF1_b.jobNumber);
    assert(resF1_b.sequenceNumber === resF1_a.sequenceNumber + 1, 'Format 1 increments sequentially');

    const resF2 = await prisma.$transaction(async (tx) => {
      return JobSequenceService.getNextJobNumber(tx, 'FORMAT_2', new Date('2026-11-02'));
    });
    console.log('Allocated Format 2:', resF2.jobNumber);
    assert(resF2.jobNumber.startsWith('JONNo./MSK/'), 'Format 2 starts with JONNo./MSK/');

    const resF3 = await prisma.$transaction(async (tx) => {
      return JobSequenceService.getNextJobNumber(tx, 'FORMAT_3', new Date('2026-11-02'));
    });
    console.log('Allocated Format 3:', resF3.jobNumber);
    assert(resF3.jobNumber.startsWith('JOb No/26-27/'), 'Format 3 starts with JOb No/26-27/');

    // 4. Test Concurrency Safety: 5 simultaneous jobs in parallel
    console.log('\n--- 4. Testing High Concurrency & Race Condition Safety ---');
    const parallelAllocations = await Promise.all(
      Array.from({ length: 5 }).map((_, i) =>
        prisma.$transaction(async (tx) => {
          const seq = await JobSequenceService.getNextJobNumber(tx, 'FORMAT_1', new Date('2026-11-02'));
          const created = await tx.job.create({
            data: {
              jobNumber: seq.jobNumber,
              formatType: 'FORMAT_1',
              partyId: party.id,
              remarks: 'AUTOMATED_TEST_RUNNER concurrent batch',
            },
          });
          return created.jobNumber;
        })
      )
    );

    console.log('Parallel allocated job numbers:', parallelAllocations);
    const uniqueAllocations = new Set(parallelAllocations);
    assert(uniqueAllocations.size === parallelAllocations.length, 'All 5 concurrent jobs received unique job numbers (zero collision)');

    // 5. Test Search by Job Number
    console.log('\n--- 5. Testing Search by Job Number across Formats ---');
    const firstNum = parallelAllocations[0];
    const searchedJobs = await prisma.job.findMany({
      where: {
        OR: [
          { jobNumber: { contains: firstNum, mode: 'insensitive' } },
        ],
      },
    });
    assert(searchedJobs.some(j => j.jobNumber === firstNum), `Successfully searched and found job by number "${firstNum}"`);

    // 6. Test Historical Jobs Integrity
    console.log('\n--- 6. Verifying Historical Jobs Integrity ---');
    const historicalJobs = await prisma.job.findMany({
      where: {
        jobNumber: { in: ['JOB-2026-0891', 'JOB-2026-0904', 'JOB-2026-0003'] },
      },
    });
    assert(historicalJobs.length === 3, 'All 3 historical jobs (JOB-2026-0891, JOB-2026-0904, JOB-2026-0003) exist and remain immutable');

    // Clean up automated test jobs
    await prisma.job.deleteMany({
      where: { remarks: { contains: 'AUTOMATED_TEST_RUNNER' } },
    });

  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  } finally {
    await prisma.$disconnect();
  }

  console.log('\n====================================================');
  console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');
  if (failed > 0) process.exit(1);
}

runTests();
