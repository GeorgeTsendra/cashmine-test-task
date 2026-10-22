// All text shown to the user. To add a language, write another object with the same shape (the
// `Strings` type) and pick it here by locale; no other file contains display text.
export const strings = {
  common: {
    back: '‹ Back',
    loading: 'Loading',
    available: 'Available',
    pending: 'Pending',
    claiming: 'Claiming',
    amount: 'Amount',
    fee: 'Fee',
    minimum: 'Minimum',
    youReceive: 'You receive',
    to: 'To',
    claim: 'Claim',
    retry: 'Retry',
    retrying: 'Retrying…',
    close: 'Close',
    cancel: 'Cancel',
    noValue: '—',
  },

  time: {
    justNow: 'just now',
    secondsAgo: (n: number) => `${n} s ago`,
    minutesAgo: (n: number) => `${n} min ago`,
    hoursAgo: (n: number) => `${n} h ago`,
  },

  token: {
    title: 'CashMine',
    subtitle: 'Enter your access token to see and claim your payback.',
    label: 'Access token',
    placeholder: 'Paste token',
    show: 'Show',
    hide: 'Hide',
    showToken: 'Show token',
    hideToken: 'Hide token',
    continue: 'Continue',
    errorEmpty: 'Paste your access token to continue.',
    errorSpaces: 'The token must not contain spaces or line breaks.',
    rejected: 'Your token was rejected or has expired. Enter a new one to continue.',
  },

  home: {
    title: 'Payback',
    changeToken: 'Change token',
  },

  balances: {
    loading: 'Loading balances…',
    emptyTitle: 'No payback yet',
    emptyMessage: 'Your balances will appear here once you have earned payback.',
    total: 'Total balance',
    totalUnavailable: 'The USD total is unavailable right now.',
    claimAsset: (asset: string) => `Claim ${asset}`,
    updated: (age: string) => `Updated ${age}`,
    updatedUnknown: 'Updated at an unknown time',
    mayBeOutOfDate: ' · may be out of date',
    refresh: 'Refresh',
    refreshing: 'Refreshing…',
  },

  query: {
    loading: 'Loading…',
    emptyTitle: 'Nothing here yet',
    refreshFailed: (reason: string) => `Couldn't refresh. ${reason}`,
  },

  errors: {
    generic: 'Something went wrong. Please try again.',
    network: "Can't reach the server. Check your connection and try again.",
    timeout: 'The server took too long to respond. Please try again.',
    unreadable: 'The server sent an unreadable response. Please try again.',
    tooManyRequests: 'Too many requests. Try again in a moment.',
    tooManyRequestsIn: (seconds: number) => `Too many requests. Try again in ${seconds} s.`,
    server: 'The server had a problem. Please try again.',
  },

  amountErrors: {
    empty: 'Enter an amount.',
    format: 'Use digits and a dot, for example 0.5. No commas, signs or leading zeros.',
    tooManyDecimals: (asset: string, decimals: number) => `${asset} allows at most ${decimals} decimal places.`,
    belowMin: (minimum: string) => `The minimum is ${minimum}.`,
    aboveAvailable: (available: string) => `You can claim at most ${available}.`,
    receiveNotPositive: 'The amount must be larger than the fee.',
    rulesUnavailable: "Can't read the claim limits right now. Try again.",
  },

  claim: {
    title: 'Claim',
    assetGroup: 'Asset',
    destinationGroup: 'Destination',
    emptyTitle: 'Nothing to claim yet',
    loadingOptions: 'Loading claim options…',
    availableLine: (amount: string) => `Available: ${amount}`,
    amountIn: (asset: string) => `Amount in ${asset}`,
    amountPlaceholder: '0',
    max: 'Max',
    useMax: (asset: string) => `Use the maximum ${asset} amount`,
    noDestination: (asset: string) => `No destination is available for ${asset} right now.`,
    review: 'Review claim',
  },

  confirm: {
    title: 'Confirm claim',
    confirm: 'Confirm claim',
    checkAgain: 'Check again',
    submitting: 'Submitting…',
    notes: {
      confirm: 'This sends the claim to the destination above and cannot be undone.',
      submitting: "Sending your claim. Please don't close this page.",
      unknown:
        "We couldn't confirm whether your claim went through. It may already be in progress. Checking again sends the same request, so it can never create a second claim.",
      rejected: 'Nothing was claimed.',
    },
  },

  status: {
    loading: 'Loading claim…',
    titles: {
      pending: 'Claim in progress',
      completed: 'Claim completed',
      failed: 'Claim failed',
    },
    pendingBody: 'This usually takes about 20 seconds. You can leave this page. Your balance catches up within about 15 seconds.',
    completedBody: (received: string, destination: string) => `${received} was sent to ${destination}.`,
    failedBody: (amount: string) => `Your ${amount} is back in your available balance.`,
    failureReason: (reason: string) => ` Reason: ${reason}`,
    claimId: (id: string) => `Claim ${id}`,
    backToBalances: 'Back to balances',
    tryAgain: 'Try again',
  },

  attempt: {
    banner: (amount: string, asset: string) =>
      `We could not confirm your claim of ${amount} ${asset}. It may already be in progress. Checking again sends the same request, so it cannot create a second claim.`,
    checkStatus: 'Check status',
    checking: 'Checking…',
  },
};

export type Strings = typeof strings;
