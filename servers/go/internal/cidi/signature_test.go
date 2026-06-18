package cidi

import "testing"

func TestGenerateSignatureMatchesOtherDemoServers(t *testing.T) {
	timestamp := "1768393700"
	nonce := "f47ac10b58cc4d"
	secret := "secret"

	cases := []struct {
		name       string
		params     SignableParams
		signString string
		signature  string
	}{
		{
			name: "basic",
			params: SignableParams{
				"gameToken": "abc123",
				"startTime": 1768390000,
				"endTime":   1768393600,
			},
			signString: "endTime=1768393600&gameToken=abc123&startTime=1768390000&timestamp=1768393700&nonce=f47ac10b58cc4d",
			signature:  "4710f9a07ab2ef02ce4fcc6bcb67c76c980e6becb4354940569790e50f2a6cc2",
		},
		{
			name: "empty-values",
			params: SignableParams{
				"gameToken": "abc123",
				"empty":     "",
				"nil":       nil,
				"amount":    10,
			},
			signString: "amount=10&gameToken=abc123&timestamp=1768393700&nonce=f47ac10b58cc4d",
			signature:  "377289d5383a901084fd3a85bce51c115e37cb2555b687fb23ee45dfe00b760c",
		},
		{
			name: "boolean",
			params: SignableParams{
				"gameToken": "abc123",
				"success":   true,
				"enabled":   false,
			},
			signString: "enabled=false&gameToken=abc123&success=true&timestamp=1768393700&nonce=f47ac10b58cc4d",
			signature:  "853a06e9382605d33354df8022bd752bfa7d1936b022c298ea7a15830b7ae581",
		},
		{
			name: "decimal",
			params: SignableParams{
				"gameToken": "abc123",
				"amount":    10.5,
			},
			signString: "amount=10.5&gameToken=abc123&timestamp=1768393700&nonce=f47ac10b58cc4d",
			signature:  "f14e0d9ae0bea1b858868cb472036d5bdd33b176c80c4246a4f1fbf91e6abe97",
		},
	}

	for _, item := range cases {
		t.Run(item.name, func(t *testing.T) {
			if actual := BuildSignString(item.params, timestamp, nonce); actual != item.signString {
				t.Fatalf("unexpected sign string\nwant: %s\n got: %s", item.signString, actual)
			}

			if actual := GenerateSignature(item.params, timestamp, nonce, secret); actual != item.signature {
				t.Fatalf("unexpected signature\nwant: %s\n got: %s", item.signature, actual)
			}
		})
	}
}

func TestStringMetadataCanCarryJSONWithoutChangingSignatureOrder(t *testing.T) {
	params := SignableParams{
		"gameToken": "abc123",
		"metadata":  "{\"level\":3,\"item\":\"sword\"}",
		"tags":      "[\"a\",\"b\"]",
	}

	signString := BuildSignString(params, "1768393700", "f47ac10b58cc4d")
	expected := "gameToken=abc123&metadata={\"level\":3,\"item\":\"sword\"}&tags=[\"a\",\"b\"]&timestamp=1768393700&nonce=f47ac10b58cc4d"
	if signString != expected {
		t.Fatalf("unexpected sign string\nwant: %s\n got: %s", expected, signString)
	}
}
