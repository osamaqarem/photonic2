const alertsWebTodo = {
  showError: (msg: string) => Promise.resolve(alert(msg)),
  showNotification: (options: { message: string }) => Promise.resolve(alert(options.message)),
  showAlert: () => Promise.resolve(alert("TODO")).then(() => "confirm"),
  showModal: () => Promise.resolve(alert("TODO")).then(() => "confirm"),
  isPresenting: false,
}

export function useAlerts() {
  return alertsWebTodo
}

useAlerts.global = alertsWebTodo
