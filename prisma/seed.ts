import { Prisma, PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { addDays, startOfMonth, subDays, subMonths } from 'date-fns';

const prisma = new PrismaClient();

const DEMO_EMAIL = process.env.DEMO_EMAIL ?? 'demo@finanza.app';
const DEMO_PASSWORD = process.env.DEMO_PASSWORD ?? 'Demo@12345';

const defaultCategories: {
  name: string;
  nameAr: string;
  icon: string;
  color: string;
}[] = [
  { name: 'Food', nameAr: 'طعام', icon: 'utensils', color: '#e05252' },
  {
    name: 'Grocery',
    nameAr: 'بقالة',
    icon: 'shopping-cart',
    color: '#e08b3a',
  },
  {
    name: 'Transportation',
    nameAr: 'مواصلات',
    icon: 'bus',
    color: '#d4a72c',
  },
  { name: 'Fuel', nameAr: 'وقود', icon: 'fuel', color: '#a3b02d' },
  { name: 'Bills', nameAr: 'فواتير', icon: 'receipt', color: '#57a639' },
  { name: 'Rent', nameAr: 'إيجار', icon: 'home', color: '#2fa864' },
  {
    name: 'Mortgage',
    nameAr: 'رهن عقاري',
    icon: 'landmark',
    color: '#2aa5a0',
  },
  {
    name: 'Entertainment',
    nameAr: 'ترفيه',
    icon: 'clapperboard',
    color: '#3a9bdc',
  },
  {
    name: 'Shopping',
    nameAr: 'تسوق',
    icon: 'shopping-bag',
    color: '#5b7fe8',
  },
  {
    name: 'Healthcare',
    nameAr: 'رعاية صحية',
    icon: 'heart-pulse',
    color: '#8b6ce8',
  },
  {
    name: 'Education',
    nameAr: 'تعليم',
    icon: 'graduation-cap',
    color: '#b35fd6',
  },
  { name: 'Family', nameAr: 'عائلة', icon: 'users', color: '#d65fb3' },
  {
    name: 'Savings',
    nameAr: 'مدخرات',
    icon: 'piggy-bank',
    color: '#e0559a',
  },
  {
    name: 'Investments',
    nameAr: 'استثمارات',
    icon: 'trending-up',
    color: '#39a0a6',
  },
  {
    name: 'Pets',
    nameAr: 'حيوانات أليفة',
    icon: 'paw-print',
    color: '#9c7b4f',
  },
  { name: 'Gifts', nameAr: 'هدايا', icon: 'gift', color: '#c95252' },
  { name: 'Travel', nameAr: 'سفر', icon: 'plane', color: '#4f8fc9' },
  {
    name: 'Subscriptions',
    nameAr: 'اشتراكات',
    icon: 'repeat',
    color: '#6b6bd6',
  },
  {
    name: 'Other',
    nameAr: 'أخرى',
    icon: 'circle-ellipsis',
    color: '#8a8f98',
  },
];

function calendarDate(value: Date): Date {
  return new Date(
    Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()),
  );
}

async function seedDefaultCategories() {
  for (const category of defaultCategories) {
    const existing = await prisma.category.findFirst({
      where: { name: category.name, isDefault: true, userId: null },
    });
    if (existing) {
      await prisma.category.update({
        where: { id: existing.id },
        data: category,
      });
    } else {
      await prisma.category.create({
        data: { ...category, isDefault: true },
      });
    }
  }
}

async function seedDemoUser() {
  const now = new Date();
  const currentSalaryDate = subDays(now, 21);
  const previousSalaryDate = subMonths(currentSalaryDate, 1);
  const olderSalaryDate = subMonths(currentSalaryDate, 2);
  const currentMonth = calendarDate(startOfMonth(now));
  const previousMonth = calendarDate(startOfMonth(subMonths(now, 1)));

  // The seed owns only this explicitly designated showcase account.
  await prisma.user.deleteMany({ where: { email: DEMO_EMAIL.toLowerCase() } });

  const user = await prisma.user.create({
    data: {
      email: DEMO_EMAIL.toLowerCase(),
      name: 'Omar Demo',
      passwordHash: await bcrypt.hash(DEMO_PASSWORD, 10),
      provider: 'LOCAL',
      emailVerifiedAt: now,
      settings: {
        create: {
          currency: 'JOD',
          locale: 'en',
          theme: 'light',
          dateFormat: 'dd/MM/yyyy',
          monthlyReportEmail: true,
          monthlyReportDay: 27,
          privacyMode: {
            enabled: false,
            sections: {
              income: true,
              expenses: true,
              budgets: true,
              debts: true,
              savings: true,
              dashboard: true,
              charts: true,
            },
          },
        },
      },
    },
  });

  const categories = await prisma.category.findMany({
    where: { isDefault: true, userId: null },
  });
  const categoryIds = new Map(
    categories.map((category) => [category.name, category.id]),
  );
  const categoryId = (name: string) => {
    const id = categoryIds.get(name);
    if (!id) throw new Error(`Missing seeded category: ${name}`);
    return id;
  };

  const [mainJob, freelanceJob] = await Promise.all([
    prisma.job.create({
      data: {
        userId: user.id,
        name: 'Product Designer',
        type: 'FULL_TIME',
        employer: 'Amman Digital Studio',
        expectedAmount: 1850,
        payDayOfMonth: 27,
        active: true,
        notes: 'Primary job with a fixed monthly salary',
      },
    }),
    prisma.job.create({
      data: {
        userId: user.id,
        name: 'Freelance Photography',
        type: 'FREELANCE',
        employer: null,
        expectedAmount: 250,
        payDayOfMonth: null,
        active: true,
        notes: 'Occasional weekend projects',
      },
    }),
  ]);

  const [currentSalary, previousSalary, olderSalary] = await Promise.all([
    prisma.income.create({
      data: {
        userId: user.id,
        jobId: mainJob.id,
        amount: 1850,
        date: currentSalaryDate,
        source: 'SALARY',
        description: 'Monthly salary',
      },
    }),
    prisma.income.create({
      data: {
        userId: user.id,
        jobId: mainJob.id,
        amount: 1800,
        date: previousSalaryDate,
        source: 'SALARY',
        description: 'Monthly salary',
      },
    }),
    prisma.income.create({
      data: {
        userId: user.id,
        jobId: mainJob.id,
        amount: 1800,
        date: olderSalaryDate,
        source: 'SALARY',
        description: 'Monthly salary',
      },
    }),
  ]);

  await prisma.income.createMany({
    data: [
      {
        userId: user.id,
        jobId: freelanceJob.id,
        amount: 320,
        date: addDays(currentSalaryDate, 8),
        source: 'FREELANCE',
        description: 'Event photography project',
      },
      {
        userId: user.id,
        amount: 150,
        date: addDays(previousSalaryDate, 5),
        source: 'BONUS',
        description: 'Quarterly performance bonus',
      },
      {
        userId: user.id,
        amount: 42,
        date: addDays(olderSalaryDate, 12),
        source: 'INVESTMENT',
        description: 'Investment dividend',
      },
    ],
  });

  const [rentRecurring, streamingRecurring, internetRecurring, gymRecurring] =
    await Promise.all([
      prisma.recurringPayment.create({
        data: {
          userId: user.id,
          name: 'Apartment rent',
          amount: 550,
          categoryId: categoryId('Rent'),
          paymentMethod: 'BANK_TRANSFER',
          frequency: 'MONTHLY',
          intervalCount: 1,
          nextDueDate: addDays(now, 9),
          active: true,
        },
      }),
      prisma.recurringPayment.create({
        data: {
          userId: user.id,
          name: 'Streaming service',
          amount: 11.99,
          categoryId: categoryId('Subscriptions'),
          paymentMethod: 'CREDIT_CARD',
          frequency: 'MONTHLY',
          intervalCount: 1,
          nextDueDate: addDays(now, 4),
          active: true,
        },
      }),
      prisma.recurringPayment.create({
        data: {
          userId: user.id,
          name: 'Home internet',
          amount: 32,
          categoryId: categoryId('Bills'),
          paymentMethod: 'CREDIT_CARD',
          frequency: 'MONTHLY',
          intervalCount: 1,
          nextDueDate: addDays(now, 6),
          active: true,
        },
      }),
      prisma.recurringPayment.create({
        data: {
          userId: user.id,
          name: 'Gym membership',
          amount: 29,
          categoryId: categoryId('Healthcare'),
          paymentMethod: 'DEBIT_CARD',
          frequency: 'MONTHLY',
          intervalCount: 1,
          nextDueDate: addDays(now, 12),
          active: true,
        },
      }),
    ]);

  const phoneInstallment = await prisma.installment.create({
    data: {
      userId: user.id,
      name: 'Smartphone',
      totalPrice: 900,
      downPayment: 150,
      monthlyAmount: 75,
      totalInstallments: 10,
      paidInstallments: 3,
      salaryIncomeId: olderSalary.id,
      startDate: subMonths(now, 5),
      notes: 'Interest-free store installment plan',
    },
  });

  const expenses: Prisma.ExpenseCreateManyInput[] = [
    {
      userId: user.id,
      amount: 550,
      date: addDays(currentSalaryDate, 1),
      categoryId: categoryId('Rent'),
      paymentMethod: 'BANK_TRANSFER',
      description: 'Apartment rent',
      salaryIncomeId: currentSalary.id,
      recurringPaymentId: rentRecurring.id,
    },
    {
      userId: user.id,
      amount: 138.4,
      date: addDays(currentSalaryDate, 2),
      categoryId: categoryId('Grocery'),
      paymentMethod: 'DEBIT_CARD',
      description: 'Monthly supermarket run',
      salaryIncomeId: currentSalary.id,
    },
    {
      userId: user.id,
      amount: 76.25,
      date: addDays(currentSalaryDate, 12),
      categoryId: categoryId('Grocery'),
      paymentMethod: 'DEBIT_CARD',
      description: 'Fresh groceries',
      salaryIncomeId: currentSalary.id,
    },
    {
      userId: user.id,
      amount: 18.5,
      date: addDays(currentSalaryDate, 3),
      categoryId: categoryId('Food'),
      paymentMethod: 'CASH',
      description: 'Lunch with colleagues',
      salaryIncomeId: currentSalary.id,
    },
    {
      userId: user.id,
      amount: 27,
      date: addDays(currentSalaryDate, 9),
      categoryId: categoryId('Food'),
      paymentMethod: 'CREDIT_CARD',
      description: 'Family dinner',
      salaryIncomeId: currentSalary.id,
    },
    {
      userId: user.id,
      amount: 12.75,
      date: addDays(currentSalaryDate, 15),
      categoryId: categoryId('Food'),
      paymentMethod: 'CASH',
      description: 'Coffee and breakfast',
      salaryIncomeId: currentSalary.id,
    },
    {
      userId: user.id,
      amount: 51,
      date: addDays(currentSalaryDate, 5),
      categoryId: categoryId('Fuel'),
      paymentMethod: 'CREDIT_CARD',
      description: 'Fuel refill',
      salaryIncomeId: currentSalary.id,
    },
    {
      userId: user.id,
      amount: 46,
      date: addDays(currentSalaryDate, 17),
      categoryId: categoryId('Fuel'),
      paymentMethod: 'CREDIT_CARD',
      description: 'Fuel refill',
      salaryIncomeId: currentSalary.id,
    },
    {
      userId: user.id,
      amount: 68,
      date: addDays(currentSalaryDate, 7),
      categoryId: categoryId('Bills'),
      paymentMethod: 'BANK_TRANSFER',
      description: 'Electricity and water',
      salaryIncomeId: currentSalary.id,
    },
    {
      userId: user.id,
      amount: 32,
      date: addDays(currentSalaryDate, 8),
      categoryId: categoryId('Bills'),
      paymentMethod: 'CREDIT_CARD',
      description: 'Home internet',
      salaryIncomeId: currentSalary.id,
      recurringPaymentId: internetRecurring.id,
    },
    {
      userId: user.id,
      amount: 75,
      date: addDays(currentSalaryDate, 10),
      categoryId: categoryId('Shopping'),
      paymentMethod: 'CREDIT_CARD',
      description: 'Smartphone installment',
      salaryIncomeId: currentSalary.id,
      installmentId: phoneInstallment.id,
    },
    {
      userId: user.id,
      amount: 44,
      date: addDays(currentSalaryDate, 13),
      categoryId: categoryId('Entertainment'),
      paymentMethod: 'DEBIT_CARD',
      description: 'Cinema and snacks',
      salaryIncomeId: currentSalary.id,
    },
    {
      userId: user.id,
      amount: 11.99,
      date: addDays(currentSalaryDate, 14),
      categoryId: categoryId('Subscriptions'),
      paymentMethod: 'CREDIT_CARD',
      description: 'Streaming service',
      salaryIncomeId: currentSalary.id,
      recurringPaymentId: streamingRecurring.id,
    },
    {
      userId: user.id,
      amount: 29,
      date: addDays(currentSalaryDate, 16),
      categoryId: categoryId('Healthcare'),
      paymentMethod: 'DEBIT_CARD',
      description: 'Gym membership',
      salaryIncomeId: currentSalary.id,
      recurringPaymentId: gymRecurring.id,
    },
    {
      userId: user.id,
      amount: 550,
      date: addDays(previousSalaryDate, 1),
      categoryId: categoryId('Rent'),
      paymentMethod: 'BANK_TRANSFER',
      description: 'Apartment rent',
      salaryIncomeId: previousSalary.id,
      recurringPaymentId: rentRecurring.id,
    },
    {
      userId: user.id,
      amount: 192.7,
      date: addDays(previousSalaryDate, 3),
      categoryId: categoryId('Grocery'),
      paymentMethod: 'DEBIT_CARD',
      description: 'Groceries',
      salaryIncomeId: previousSalary.id,
    },
    {
      userId: user.id,
      amount: 97,
      date: addDays(previousSalaryDate, 8),
      categoryId: categoryId('Food'),
      paymentMethod: 'CASH',
      description: 'Restaurants and coffee',
      salaryIncomeId: previousSalary.id,
    },
    {
      userId: user.id,
      amount: 103,
      date: addDays(previousSalaryDate, 11),
      categoryId: categoryId('Fuel'),
      paymentMethod: 'CREDIT_CARD',
      description: 'Fuel for the month',
      salaryIncomeId: previousSalary.id,
    },
    {
      userId: user.id,
      amount: 85,
      date: addDays(previousSalaryDate, 15),
      categoryId: categoryId('Shopping'),
      paymentMethod: 'CREDIT_CARD',
      description: 'Clothing',
      salaryIncomeId: previousSalary.id,
    },
    {
      userId: user.id,
      amount: 75,
      date: addDays(previousSalaryDate, 17),
      categoryId: categoryId('Shopping'),
      paymentMethod: 'CREDIT_CARD',
      description: 'Smartphone installment',
      salaryIncomeId: previousSalary.id,
      installmentId: phoneInstallment.id,
    },
    {
      userId: user.id,
      amount: 550,
      date: addDays(olderSalaryDate, 1),
      categoryId: categoryId('Rent'),
      paymentMethod: 'BANK_TRANSFER',
      description: 'Apartment rent',
      salaryIncomeId: olderSalary.id,
      recurringPaymentId: rentRecurring.id,
    },
    {
      userId: user.id,
      amount: 220,
      date: addDays(olderSalaryDate, 4),
      categoryId: categoryId('Grocery'),
      paymentMethod: 'DEBIT_CARD',
      description: 'Groceries',
      salaryIncomeId: olderSalary.id,
    },
    {
      userId: user.id,
      amount: 128,
      date: addDays(olderSalaryDate, 12),
      categoryId: categoryId('Food'),
      paymentMethod: 'CASH',
      description: 'Dining out',
      salaryIncomeId: olderSalary.id,
    },
    {
      userId: user.id,
      amount: 140,
      date: addDays(olderSalaryDate, 16),
      categoryId: categoryId('Travel'),
      paymentMethod: 'CREDIT_CARD',
      description: 'Weekend trip',
      salaryIncomeId: olderSalary.id,
    },
    {
      userId: user.id,
      amount: 34,
      date: subDays(now, 2),
      categoryId: categoryId('Gifts'),
      paymentMethod: 'CASH',
      description: 'Birthday gift',
      salaryIncomeId: null,
      notes: 'Left unassigned to demonstrate bulk salary assignment',
    },
  ];
  await prisma.expense.createMany({ data: expenses });

  await prisma.budget.createMany({
    data: [
      { userId: user.id, month: currentMonth, amount: 1650 },
      {
        userId: user.id,
        month: currentMonth,
        amount: 260,
        categoryId: categoryId('Grocery'),
      },
      {
        userId: user.id,
        month: currentMonth,
        amount: 180,
        categoryId: categoryId('Food'),
      },
      {
        userId: user.id,
        month: currentMonth,
        amount: 130,
        categoryId: categoryId('Fuel'),
      },
      {
        userId: user.id,
        month: currentMonth,
        amount: 100,
        categoryId: categoryId('Entertainment'),
      },
      { userId: user.id, month: previousMonth, amount: 1600 },
    ],
  });

  const carLoan = await prisma.debt.create({
    data: {
      userId: user.id,
      name: 'Car loan',
      direction: 'OWED_BY_ME',
      type: 'CAR_LOAN',
      originalAmount: 9500,
      interestRate: 4.5,
      monthlyPayment: 260,
      startDate: subMonths(now, 12),
      dueDate: addDays(subMonths(now, -24), 10),
      counterparty: 'Jordan Auto Finance',
      notes: 'Automatic payment on the 5th of each month',
      payments: {
        create: Array.from({ length: 10 }, (_, index) => ({
          amount: index === 2 ? 360 : 260,
          date: addDays(subMonths(now, 10 - index), 4),
          isExtra: index === 2,
          notes: index === 2 ? 'Included a 100 JOD extra payment' : null,
        })),
      },
    },
  });

  await prisma.debt.create({
    data: {
      userId: user.id,
      name: 'Credit card balance',
      direction: 'OWED_BY_ME',
      type: 'CREDIT_CARD',
      originalAmount: 720,
      interestRate: 0,
      monthlyPayment: 120,
      startDate: subMonths(now, 3),
      dueDate: addDays(now, 20),
      counterparty: 'Demo Bank',
      payments: {
        create: [
          { amount: 120, date: subMonths(now, 2), isExtra: false },
          { amount: 180, date: subMonths(now, 1), isExtra: true },
        ],
      },
    },
  });

  const receivable = await prisma.debt.create({
    data: {
      userId: user.id,
      name: 'Loan to Ahmad',
      direction: 'OWED_TO_ME',
      type: 'PERSONAL_LOAN',
      originalAmount: 800,
      interestRate: 0,
      monthlyPayment: 100,
      startDate: subMonths(now, 4),
      dueDate: addDays(now, 45),
      counterparty: 'Ahmad',
      notes: 'Friendly loan with flexible monthly repayments',
    },
  });
  const repaymentIncome = await prisma.income.create({
    data: {
      userId: user.id,
      amount: 250,
      date: subDays(now, 6),
      source: 'OTHER',
      description: 'Debt repayment from Ahmad',
    },
  });
  const repaymentSavings = await prisma.savingsAsset.create({
    data: {
      userId: user.id,
      type: 'CASH',
      name: 'Repayment cash',
      amount: 250,
      notes: 'Received from Ahmad',
    },
  });
  await prisma.debtPayment.create({
    data: {
      debtId: receivable.id,
      amount: 250,
      date: subDays(now, 6),
      isExtra: false,
      notes: 'First repayment received',
      incomeId: repaymentIncome.id,
      savingsAssetId: repaymentSavings.id,
    },
  });

  await prisma.savingsAsset.createMany({
    data: [
      {
        userId: user.id,
        type: 'CASH',
        name: 'Emergency fund',
        amount: 3200,
        notes: 'Target: six months of essential expenses',
      },
      {
        userId: user.id,
        type: 'GOLD',
        name: 'Two Rashadi liras',
        weightGrams: 14.432,
        karat: 21,
        goldForm: 'RASHADI_LIRA',
        quantity: 2,
      },
      {
        userId: user.id,
        type: 'SILVER',
        name: 'Silver bar',
        weightGrams: 250,
        purityPermille: 999,
      },
      {
        userId: user.id,
        type: 'OTHER',
        name: 'Index fund',
        amount: 1850,
        notes: 'Long-term investment account',
      },
    ],
  });

  await prisma.recurringApproval.createMany({
    data: [
      {
        recurringPaymentId: streamingRecurring.id,
        userId: user.id,
        date: addDays(now, 4),
        amount: 11.99,
        status: 'PENDING',
      },
      {
        recurringPaymentId: internetRecurring.id,
        userId: user.id,
        date: subDays(now, 24),
        amount: 32,
        status: 'APPROVED',
      },
      {
        recurringPaymentId: gymRecurring.id,
        userId: user.id,
        date: subDays(now, 18),
        amount: 29,
        status: 'REMOVED',
      },
    ],
  });

  await prisma.vehicle.create({
    data: {
      userId: user.id,
      make: 'Toyota',
      model: 'Corolla',
      year: 2021,
      odometerKm: 86420,
      dailyCommuteKm: 34,
      commuteDays: [0, 1, 2, 3, 4],
      autoTrackingEnabled: true,
      lastAutoSyncDate: calendarDate(now),
      drives: {
        create: [
          {
            type: 'PERSONAL',
            date: calendarDate(subDays(now, 2)),
            distanceKm: 42,
            odometerAfterKm: 86420,
            notes: 'Family visit',
          },
          {
            type: 'COMMUTE',
            date: calendarDate(subDays(now, 3)),
            distanceKm: 34,
            odometerAfterKm: 86378,
            notes: 'Automatic scheduled commute',
          },
          {
            type: 'ODOMETER_READING',
            date: calendarDate(subDays(now, 10)),
            distanceKm: 8,
            odometerAfterKm: 86140,
            notes: 'Corrected from dashboard reading',
          },
        ],
      },
      maintenanceItems: {
        create: [
          {
            name: 'Engine oil',
            intervalKm: 5000,
            lastServiceOdometerKm: 82000,
            notes: 'Use manufacturer-recommended synthetic oil',
            records: {
              create: {
                date: calendarDate(subMonths(now, 4)),
                odometerKm: 82000,
                notes: 'Oil and filter changed',
              },
            },
          },
          {
            name: 'Air filter',
            intervalKm: 10000,
            lastServiceOdometerKm: 80000,
            notes: 'Inspect sooner during dusty weather',
          },
          {
            name: 'Tires',
            intervalKm: 25000,
            lastServiceOdometerKm: 65000,
            notes: 'Rotation and inspection',
          },
        ],
      },
    },
  });

  await prisma.aiConversation.create({
    data: {
      userId: user.id,
      title: 'How is my current salary cycle going?',
      messages: {
        create: [
          {
            role: 'user',
            content: 'How is my current salary cycle going?',
          },
          {
            role: 'assistant',
            content:
              'Your current salary cycle is healthy, but rent and groceries are your largest categories. Keep an eye on discretionary food and shopping spending before the next salary.',
            proposals: [],
          },
        ],
      },
    },
  });

  return {
    user,
    counts: {
      jobs: 2,
      salaryCycles: 3,
      expenses: expenses.length,
      debts: 3,
      installments: 1,
      recurringPayments: 4,
      savingsAssets: 5,
      vehicles: 1,
    },
    showcaseDebt: carLoan.name,
  };
}

async function main() {
  await seedDefaultCategories();
  const demo = await seedDemoUser();

  console.log(`Seeded ${defaultCategories.length} default categories.`);
  console.log(`Seeded demo account ${demo.user.email}.`);
  console.log(`Demo password: ${DEMO_PASSWORD}`);
  console.log(`Demo records: ${JSON.stringify(demo.counts)}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
