import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { AuthResponse, ErrorResponse, HealthStatus, LoginInput, MessageResponse, Product, ProductAnalysis, ProfileInput, RegisterInput, SearchProductsParams, SendOtpInput, UserProfile, VerifyOtpInput } from './api.schemas';
import { customFetch } from '../custom-fetch';
import type { ErrorType, BodyType } from '../custom-fetch';
type AwaitedInput<T> = PromiseLike<T> | T;
type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;
type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];
export declare const getHealthCheckUrl: () => string;
/**
 * @summary Health check
 */
export declare const healthCheck: (options?: RequestInit) => Promise<HealthStatus>;
export declare const getHealthCheckQueryKey: () => readonly ["/api/healthz"];
export declare const getHealthCheckQueryOptions: <TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData> & {
    queryKey: QueryKey;
};
export type HealthCheckQueryResult = NonNullable<Awaited<ReturnType<typeof healthCheck>>>;
export type HealthCheckQueryError = ErrorType<unknown>;
/**
 * @summary Health check
 */
export declare function useHealthCheck<TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getRegisterUrl: () => string;
/**
 * @summary Create a new account with preferences
 */
export declare const register: (registerInput: RegisterInput, options?: RequestInit) => Promise<AuthResponse>;
export declare const getRegisterMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof register>>, TError, {
        data: BodyType<RegisterInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof register>>, TError, {
    data: BodyType<RegisterInput>;
}, TContext>;
export type RegisterMutationResult = NonNullable<Awaited<ReturnType<typeof register>>>;
export type RegisterMutationBody = BodyType<RegisterInput>;
export type RegisterMutationError = ErrorType<ErrorResponse>;
/**
* @summary Create a new account with preferences
*/
export declare const useRegister: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof register>>, TError, {
        data: BodyType<RegisterInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof register>>, TError, {
    data: BodyType<RegisterInput>;
}, TContext>;
export declare const getLoginUrl: () => string;
/**
 * @summary Sign in with email and password
 */
export declare const login: (loginInput: LoginInput, options?: RequestInit) => Promise<AuthResponse>;
export declare const getLoginMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof login>>, TError, {
        data: BodyType<LoginInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof login>>, TError, {
    data: BodyType<LoginInput>;
}, TContext>;
export type LoginMutationResult = NonNullable<Awaited<ReturnType<typeof login>>>;
export type LoginMutationBody = BodyType<LoginInput>;
export type LoginMutationError = ErrorType<ErrorResponse>;
/**
* @summary Sign in with email and password
*/
export declare const useLogin: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof login>>, TError, {
        data: BodyType<LoginInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof login>>, TError, {
    data: BodyType<LoginInput>;
}, TContext>;
export declare const getSendOtpUrl: () => string;
/**
 * @summary Send a one-time passcode to the user's email
 */
export declare const sendOtp: (sendOtpInput: SendOtpInput, options?: RequestInit) => Promise<MessageResponse>;
export declare const getSendOtpMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof sendOtp>>, TError, {
        data: BodyType<SendOtpInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof sendOtp>>, TError, {
    data: BodyType<SendOtpInput>;
}, TContext>;
export type SendOtpMutationResult = NonNullable<Awaited<ReturnType<typeof sendOtp>>>;
export type SendOtpMutationBody = BodyType<SendOtpInput>;
export type SendOtpMutationError = ErrorType<ErrorResponse>;
/**
* @summary Send a one-time passcode to the user's email
*/
export declare const useSendOtp: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof sendOtp>>, TError, {
        data: BodyType<SendOtpInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof sendOtp>>, TError, {
    data: BodyType<SendOtpInput>;
}, TContext>;
export declare const getVerifyOtpUrl: () => string;
/**
 * @summary Verify a one-time passcode
 */
export declare const verifyOtp: (verifyOtpInput: VerifyOtpInput, options?: RequestInit) => Promise<MessageResponse>;
export declare const getVerifyOtpMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof verifyOtp>>, TError, {
        data: BodyType<VerifyOtpInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof verifyOtp>>, TError, {
    data: BodyType<VerifyOtpInput>;
}, TContext>;
export type VerifyOtpMutationResult = NonNullable<Awaited<ReturnType<typeof verifyOtp>>>;
export type VerifyOtpMutationBody = BodyType<VerifyOtpInput>;
export type VerifyOtpMutationError = ErrorType<ErrorResponse>;
/**
* @summary Verify a one-time passcode
*/
export declare const useVerifyOtp: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof verifyOtp>>, TError, {
        data: BodyType<VerifyOtpInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof verifyOtp>>, TError, {
    data: BodyType<VerifyOtpInput>;
}, TContext>;
export declare const getLogoutUrl: () => string;
/**
 * @summary Sign out
 */
export declare const logout: (options?: RequestInit) => Promise<MessageResponse>;
export declare const getLogoutMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof logout>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof logout>>, TError, void, TContext>;
export type LogoutMutationResult = NonNullable<Awaited<ReturnType<typeof logout>>>;
export type LogoutMutationError = ErrorType<unknown>;
/**
* @summary Sign out
*/
export declare const useLogout: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof logout>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof logout>>, TError, void, TContext>;
export declare const getGetMeUrl: () => string;
/**
 * @summary Get the currently authenticated user
 */
export declare const getMe: (options?: RequestInit) => Promise<UserProfile>;
export declare const getGetMeQueryKey: () => readonly ["/api/auth/me"];
export declare const getGetMeQueryOptions: <TData = Awaited<ReturnType<typeof getMe>>, TError = ErrorType<ErrorResponse>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMe>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getMe>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetMeQueryResult = NonNullable<Awaited<ReturnType<typeof getMe>>>;
export type GetMeQueryError = ErrorType<ErrorResponse>;
/**
 * @summary Get the currently authenticated user
 */
export declare function useGetMe<TData = Awaited<ReturnType<typeof getMe>>, TError = ErrorType<ErrorResponse>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMe>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetProfileUrl: () => string;
/**
 * @summary Get current user profile with preferences
 */
export declare const getProfile: (options?: RequestInit) => Promise<UserProfile>;
export declare const getGetProfileQueryKey: () => readonly ["/api/users/profile"];
export declare const getGetProfileQueryOptions: <TData = Awaited<ReturnType<typeof getProfile>>, TError = ErrorType<ErrorResponse>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getProfile>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getProfile>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetProfileQueryResult = NonNullable<Awaited<ReturnType<typeof getProfile>>>;
export type GetProfileQueryError = ErrorType<ErrorResponse>;
/**
 * @summary Get current user profile with preferences
 */
export declare function useGetProfile<TData = Awaited<ReturnType<typeof getProfile>>, TError = ErrorType<ErrorResponse>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getProfile>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getUpdateProfileUrl: () => string;
/**
 * @summary Update user profile and preferences
 */
export declare const updateProfile: (profileInput: ProfileInput, options?: RequestInit) => Promise<UserProfile>;
export declare const getUpdateProfileMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateProfile>>, TError, {
        data: BodyType<ProfileInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateProfile>>, TError, {
    data: BodyType<ProfileInput>;
}, TContext>;
export type UpdateProfileMutationResult = NonNullable<Awaited<ReturnType<typeof updateProfile>>>;
export type UpdateProfileMutationBody = BodyType<ProfileInput>;
export type UpdateProfileMutationError = ErrorType<ErrorResponse>;
/**
* @summary Update user profile and preferences
*/
export declare const useUpdateProfile: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateProfile>>, TError, {
        data: BodyType<ProfileInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateProfile>>, TError, {
    data: BodyType<ProfileInput>;
}, TContext>;
export declare const getSearchProductsUrl: (params?: SearchProductsParams) => string;
/**
 * @summary Search products by name or ingredient
 */
export declare const searchProducts: (params?: SearchProductsParams, options?: RequestInit) => Promise<Product[]>;
export declare const getSearchProductsQueryKey: (params?: SearchProductsParams) => readonly ["/api/products/search", ...SearchProductsParams[]];
export declare const getSearchProductsQueryOptions: <TData = Awaited<ReturnType<typeof searchProducts>>, TError = ErrorType<unknown>>(params?: SearchProductsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof searchProducts>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof searchProducts>>, TError, TData> & {
    queryKey: QueryKey;
};
export type SearchProductsQueryResult = NonNullable<Awaited<ReturnType<typeof searchProducts>>>;
export type SearchProductsQueryError = ErrorType<unknown>;
/**
 * @summary Search products by name or ingredient
 */
export declare function useSearchProducts<TData = Awaited<ReturnType<typeof searchProducts>>, TError = ErrorType<unknown>>(params?: SearchProductsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof searchProducts>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetProductUrl: (productId: string) => string;
/**
 * @summary Get product details
 */
export declare const getProduct: (productId: string, options?: RequestInit) => Promise<Product>;
export declare const getGetProductQueryKey: (productId: string) => readonly [`/api/products/${string}`];
export declare const getGetProductQueryOptions: <TData = Awaited<ReturnType<typeof getProduct>>, TError = ErrorType<ErrorResponse>>(productId: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getProduct>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getProduct>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetProductQueryResult = NonNullable<Awaited<ReturnType<typeof getProduct>>>;
export type GetProductQueryError = ErrorType<ErrorResponse>;
/**
 * @summary Get product details
 */
export declare function useGetProduct<TData = Awaited<ReturnType<typeof getProduct>>, TError = ErrorType<ErrorResponse>>(productId: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getProduct>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getAnalyzeProductUrl: (productId: string) => string;
/**
 * @summary Analyze a product against the current user's profile
 */
export declare const analyzeProduct: (productId: string, options?: RequestInit) => Promise<ProductAnalysis>;
export declare const getAnalyzeProductQueryKey: (productId: string) => readonly [`/api/products/${string}/analyze`];
export declare const getAnalyzeProductQueryOptions: <TData = Awaited<ReturnType<typeof analyzeProduct>>, TError = ErrorType<ErrorResponse>>(productId: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof analyzeProduct>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof analyzeProduct>>, TError, TData> & {
    queryKey: QueryKey;
};
export type AnalyzeProductQueryResult = NonNullable<Awaited<ReturnType<typeof analyzeProduct>>>;
export type AnalyzeProductQueryError = ErrorType<ErrorResponse>;
/**
 * @summary Analyze a product against the current user's profile
 */
export declare function useAnalyzeProduct<TData = Awaited<ReturnType<typeof analyzeProduct>>, TError = ErrorType<ErrorResponse>>(productId: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof analyzeProduct>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export {};
//# sourceMappingURL=api.d.ts.map