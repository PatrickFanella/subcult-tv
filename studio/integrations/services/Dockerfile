FROM scratch
COPY brandproxy /brandproxy
USER 65532:65532
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s CMD ["/brandproxy", "-check"]
ENTRYPOINT ["/brandproxy"]
