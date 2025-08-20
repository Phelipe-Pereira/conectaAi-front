import http from '@/services/http'
import type { components, operations } from './types'

// Tipos extraídos do OpenAPI
type Customer = components['schemas']['Customer']
type CustomerList = components['schemas']['CustomerList']
type CreateCustomerRequest = components['schemas']['CreateCustomerRequest']
type UpdateCustomerRequest = components['schemas']['UpdateCustomerRequest']

type Charge = components['schemas']['Charge']
type ChargeList = components['schemas']['ChargeList']
type CreateChargeRequest = components['schemas']['CreateChargeRequest']

type Subscription = components['schemas']['Subscription']
type SubscriptionList = components['schemas']['SubscriptionList']
type CreateSubscriptionRequest = components['schemas']['CreateSubscriptionRequest']
type UpdateSubscriptionRequest = components['schemas']['UpdateSubscriptionRequest']

type WebhookEndpoint = components['schemas']['WebhookEndpoint']
type WebhookEndpointList = components['schemas']['WebhookEndpointList']
type CreateWebhookEndpointRequest = components['schemas']['CreateWebhookEndpointRequest']
type UpdateWebhookEndpointRequest = components['schemas']['UpdateWebhookEndpointRequest']

type Notification = components['schemas']['Notification']
type NotificationList = components['schemas']['NotificationList']
type CreateNotificationRequest = components['schemas']['CreateNotificationRequest']
type UpdateNotificationRequest = components['schemas']['UpdateNotificationRequest']

// Parâmetros de query
type ListCustomersParams = operations['listCustomers']['parameters']['query']
type ListChargesParams = operations['listCharges']['parameters']['query']
type ListSubscriptionsParams = operations['listSubscriptions']['parameters']['query']
type ListNotificationsParams = operations['listNotifications']['parameters']['query']

// Cliente SDK
export const apiClient = {
  // Customers
  customers: {
    list: (params?: ListCustomersParams) => http.get<CustomerList>('/customers', { params }),

    create: (data: CreateCustomerRequest) => http.post<Customer>('/customers', data),

    get: (id: string) => http.get<Customer>(`/customers/${id}`),

    update: (id: string, data: UpdateCustomerRequest) =>
      http.patch<Customer>(`/customers/${id}`, data),

    replace: (id: string, data: CreateCustomerRequest) =>
      http.put<Customer>(`/customers/${id}`, data),

    delete: (id: string) => http.delete(`/customers/${id}`),
  },

  // Charges
  charges: {
    list: (params?: ListChargesParams) => http.get<ChargeList>('/charges', { params }),

    create: (data: CreateChargeRequest, idempotencyKey: string) =>
      http.post<Charge>('/charges', data, {
        headers: { 'Idempotency-Key': idempotencyKey },
      }),

    get: (id: string) => http.get<Charge>(`/charges/${id}`),

    update: (id: string, data: { description?: string; metadata?: Record<string, unknown> }) =>
      http.patch<Charge>(`/charges/${id}`, data),

    cancel: (id: string, idempotencyKey: string) =>
      http.delete<Charge>(`/charges/${id}`, {
        headers: { 'Idempotency-Key': idempotencyKey },
      }),

    capture: (id: string, data?: { amount_to_capture?: number }, idempotencyKey?: string) =>
      http.post<Charge>(`/charges/${id}/capture`, data, {
        headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : undefined,
      }),

    refund: (
      id: string,
      data: { amount?: number; reason?: string; metadata?: Record<string, unknown> },
    ) => http.post(`/charges/${id}/refunds`, data),
  },

  // Subscriptions
  subscriptions: {
    list: (params?: ListSubscriptionsParams) =>
      http.get<SubscriptionList>('/subscriptions', { params }),

    create: (data: CreateSubscriptionRequest) => http.post<Subscription>('/subscriptions', data),

    get: (id: string) => http.get<Subscription>(`/subscriptions/${id}`),

    update: (id: string, data: UpdateSubscriptionRequest) =>
      http.patch<Subscription>(`/subscriptions/${id}`, data),

    cancel: (id: string) => http.delete(`/subscriptions/${id}`),

    pause: (id: string) => http.post<Subscription>(`/subscriptions/${id}/pause`),

    resume: (id: string) => http.post<Subscription>(`/subscriptions/${id}/resume`),
  },

  // Webhooks
  webhooks: {
    list: () => http.get<WebhookEndpointList>('/webhooks'),

    create: (data: CreateWebhookEndpointRequest) => http.post<WebhookEndpoint>('/webhooks', data),

    get: (id: string) => http.get<WebhookEndpoint>(`/webhooks/${id}`),

    update: (id: string, data: UpdateWebhookEndpointRequest) =>
      http.put<WebhookEndpoint>(`/webhooks/${id}`, data),

    delete: (id: string) => http.delete(`/webhooks/${id}`),
  },

  // Notifications
  notifications: {
    list: (params?: ListNotificationsParams) =>
      http.get<NotificationList>('/notifications', { params }),

    create: (data: CreateNotificationRequest) => http.post<Notification>('/notifications', data),

    get: (id: string) => http.get<Notification>(`/notifications/${id}`),

    update: (id: string, data: UpdateNotificationRequest) =>
      http.put<Notification>(`/notifications/${id}`, data),

    delete: (id: string) => http.delete(`/notifications/${id}`),
  },
}

export default apiClient
