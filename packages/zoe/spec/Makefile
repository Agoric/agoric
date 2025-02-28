check: alice.log
	cat alice.log

alice.log: alice.scm
	guile alice.scm

alice.scm: ertp.scm

ertp.scm: store.scm

clean:
	rm -rf alice.log
