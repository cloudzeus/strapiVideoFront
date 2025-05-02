          <div className="space-y-1">
            <Button
              variant={pathname === "/administrator/users" ? "secondary" : "ghost"}
              className="w-full justify-start"
              asChild
            >
              <Link href="/administrator/users">
                <Users className="mr-2 h-4 w-4" />
                Users
              </Link>
            </Button>
            <Button
              variant={pathname === "/administrator/organizations" ? "secondary" : "ghost"}
              className="w-full justify-start"
              asChild
            >
              <Link href="/administrator/organizations">
                <Building2 className="mr-2 h-4 w-4" />
                Organizations
              </Link>
            </Button>
          </div> 