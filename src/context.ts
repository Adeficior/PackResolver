import type { Acceptor } from "./acceptor";
import { extendLoggerContext, type Logger } from "./logger";
import type { Resolver } from "./resolver";
import { exists } from "./util";

export type ContextLike = Record<string, unknown>;

export type BaseContext = {
  logger: Logger;
};

function hasLogger(context: ContextLike): context is BaseContext {
  return (
    "logger" in context &&
    exists(context.logger) &&
    "info" in (context.logger as Logger)
  );
}

export function extendContext<
  Context extends ContextLike,
  Additional extends ContextLike,
>(context: Context, additional: Additional): Context & Additional {
  const extended = { ...context, ...additional };

  if (hasLogger(extended)) {
    const { logger, ...loggerContext } = extended;
    extended.logger = extendLoggerContext(logger, loggerContext);
  }

  return extended;
}

export function supplyAcceptorContext<
  Data,
  Context extends ContextLike,
  Additional extends ContextLike,
>(
  acceptor: Acceptor<Data, Context & Additional>,
  additional: Additional,
): Acceptor<Data, Context> {
  return {
    accept: (path, content, context) => {
      const extended = extendContext(context, additional);
      return acceptor.accept(path, content, extended);
    },
    finalize: acceptor.finalize?.bind(acceptor),
  };
}

export function supplyResolverContext<
  Data,
  Context extends ContextLike,
  Additional extends ContextLike,
>(
  resolver: Resolver<Data, Context>,
  additional: Additional,
): Resolver<Data, Context & Additional> {
  return {
    extract: (acceptor) => {
      const supplied = supplyAcceptorContext<Data, Context, Additional>(
        acceptor,
        additional,
      );
      return resolver.extract(supplied);
    },
  };
}
