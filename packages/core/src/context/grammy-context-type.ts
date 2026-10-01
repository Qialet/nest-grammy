/**
 * Context type of a host created for a grammY update. Lets guards,
 * interceptors and exception filters tell grammY updates apart from
 * other transports.
 *
 * @example
 * catch(exception: unknown, host: ArgumentsHost) {
 *   if (host.getType<GrammyContextType>() === 'grammy') {
 *     const ctx = GrammyArgumentsHost.create(host).getContext();
 *   }
 * }
 */
export type GrammyContextType = 'grammy';
