import http from '@/services/http'
import type {
  components,
  operations,
  paths
} from './types'

// Tipos extraídos dos schemas
export type Customer = components['schemas']['Customer']
export type CreateCustomerRequest = components['schemas']['CreateCustomerRequest']
export type UpdateCustomerRequest = components['schemas']['UpdateCustomerRequest']
export type CustomerList = components['schemas']['CustomerList']

export type Charge = components['schemas']['Charge']
export type CreateChargeRequest = components['schemas']['CreateChargeRequest']
export type ChargeList = components['schemas']['ChargeList']
export type ChargeStatus = components['schemas']['ChargeStatus']
export type PaymentMethod = components['schemas']['PaymentMethod']

export type Subscription = components['schemas']['Subscription']
export type CreateSubscriptionRequest = components['schemas']['CreateSubscriptionRequest']
export type UpdateSubscriptionRequest = components['schemas']['UpdateSubscriptionRequest']
export type SubscriptionList = components['schemas']['SubscriptionList']
export type SubscriptionStatus = components['schemas']['SubscriptionStatus']

export type WebhookEndpoint = components['schemas']['WebhookEndpoint']
export type CreateWebhookEndpointRequest = components['schemas']['CreateWebhookEndpointRequest']
export type UpdateWebhookEndpointRequest = components['schemas']['UpdateWebhookEndpointRequest']
export type WebhookEndpointList = components['schemas']['WebhookEndpointList']

export type Notification = components['schemas']['Notification']
export type CreateNotificationRequest = components['schemas']['CreateNotificationRequest']
export type UpdateNotificationRequest = components['schemas']['UpdateNotificationRequest']
export type NotificationList = components['schemas']['NotificationList']
export type NotificationChannel = components['schemas']['NotificationChannel']
export type NotificationStatus = components['schemas']['NotificationStatus']

// Tipos para parâmetros de query
export type CustomerListParams = operations['listCustomers']['parameters']['query']
export type ChargeListParams = operations['listCharges']['parameters']['query']
export type SubscriptionListParams = operations['listSubscriptions']['parameters']['query']
export type NotificationListParams = operations['listNotifications']['parameters']['query']

// Cliente API fortemente tipado
export const apiClient = {
  // Customers
  customers: {
    list: (params?: CustomerListParams) =>
      http.get<CustomerList>('/customers', { params }),

    get: (id: string) =>
      http.get<Customer>(`/customers/${id}`),

    create: (data: CreateCustomerRequest) =>
      http.post<Customer>('/customers', data),

    update: (id: string, data: UpdateCustomerRequest) =>
      http.put<Customer>(`/customers/${id}`, data),

    delete: (id: string) =>
      http.delete(`/customers/${id}`)
  },

  // Charges (Payments)
  charges: {
    list: (params?: ChargeListParams) =>
      http.get<ChargeList>('/payments', { params }),

    get: (id: string) =>
      http.get<Charge>(`/payments/${id}`),

    create: (data: CreateChargeRequest) =>
      http.post<Charge>('/payments', data),

    update: (id: string, data: { description?: string; metadata?: Record<string, unknown> }) =>
      http.put<Charge>(`/payments/${id}`, data),

    cancel: (id: string) =>
      http.delete<Charge>(`/payments/${id}`),

    capture: (id: string, data?: { amount_to_capture?: number }) =>
      http.post<Charge>(`/payments/${id}/capture`, data),

    refund: (id: string, data: { amount?: number; reason?: string; metadata?: Record<string, unknown> }) =>
      http.post<components['schemas']['Refund']>(`/payments/${id}/refunds`, data)
  },

  // Subscriptions
  subscriptions: {
    list: (params?: SubscriptionListParams) =>
      http.get<SubscriptionList>('/subscriptions', { params }),

    get: (id: string) =>
      http.get<Subscription>(`/subscriptions/${id}`),

    create: (data: CreateSubscriptionRequest) =>
      http.post<Subscription>('/subscriptions', data),

    update: (id: string, data: UpdateSubscriptionRequest) =>
      http.put<Subscription>(`/subscriptions/${id}`, data),

    cancel: (id: string) =>
      http.delete(`/subscriptions/${id}`),

    pause: (id: string) =>
      http.post<Subscription>(`/subscriptions/${id}/pause`),

    resume: (id: string) =>
      http.post<Subscription>(`/subscriptions/${id}/resume`)
  },

  // Webhooks
  webhooks: {
    list: () =>
      http.get<WebhookEndpointList>('/webhooks'),

    get: (id: string) =>
      http.get<WebhookEndpoint>(`/webhooks/${id}`),

    create: (data: CreateWebhookEndpointRequest) =>
      http.post<WebhookEndpoint>('/webhooks', data),

    update: (id: string, data: UpdateWebhookEndpointRequest) =>
      http.put<WebhookEndpoint>(`/webhooks/${id}`, data),

    delete: (id: string) =>
      http.delete(`/webhooks/${id}`)
  },

  // Notifications
  notifications: {
    list: (params?: NotificationListParams) =>
      http.get<NotificationList>('/notifications', { params }),

    get: (id: string) =>
      http.get<Notification>(`/notifications/${id}`),

    create: (data: CreateNotificationRequest) =>
      http.post<Notification>('/notifications', data),

    update: (id: string, data: UpdateNotificationRequest) =>
      http.put<Notification>(`/notifications/${id}`, data),

    delete: (id: string) =>
      http.delete(`/notifications/${id}`)
  }
}

// Exportar tipos para uso em outros módulos
export type { components, operations, paths }
