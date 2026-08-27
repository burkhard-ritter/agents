# Docker Sandbox Kit for Pi

Based on https://github.com/docker/sbx-kits-contrib/tree/main/pi. But I have now quite heavily customised it so that it works well for me. E.g. it wires in the AWS credentials as well as my shared agent skills (which I keep in `~/src/agents`) and also installs deno.

To use this kit, run something like:

```bash
sbx run --kit ~/src/agents/sbx-kit-pi/ pi . ~/src/agents/ ~/.aws:ro
```

Because this is quite cumbersome, there is a small wrapper script `sbx-pi`. One way to put it on the path (depends on the specific setup, of course) is:

```bash
ln -s /home/burkhard/src/agents/sbx-kit-pi/tools/sbx-pi ~/bin/sbx-pi
```

To use the web-research skill (which uses Kagi), we need to configure credential injection for Kagi. We do this globally with:

```bash
sbx secret set-custom --host kagi.com --env KAGI_API_TOKEN
```
